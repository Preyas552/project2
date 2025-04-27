#!/bin/bash
# Deploy the Next.js Photo Gallery to AWS ECS

# Set your AWS account ID
AWS_ACCOUNT_ID="your-account-id"
AWS_REGION="us-east-1"
ECR_REPOSITORY="next-photo-gallery"
ECS_CLUSTER="photo-gallery-cluster"
ECS_SERVICE="photo-gallery-service"
TASK_FAMILY="next-photo-gallery"

# Step 1: Create ECR repository if it doesn't exist
echo "Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} || \
aws ecr create-repository --repository-name ${ECR_REPOSITORY}

# Step 2: Log in to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 3: Build and push the Docker image
echo "Building and pushing Docker image..."
IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest"
docker build -t ${IMAGE_URI} .
docker push ${IMAGE_URI}

# Step 4: Create SSM parameters for secrets
echo "Creating SSM parameters for secrets (if not already created)..."
aws ssm put-parameter --name "/photo-gallery/aws-access-key-id" --value "${AWS_ACCESS_KEY_ID}" --type "SecureString" --overwrite
aws ssm put-parameter --name "/photo-gallery/aws-secret-access-key" --value "${AWS_SECRET_ACCESS_KEY}" --type "SecureString" --overwrite
aws ssm put-parameter --name "/photo-gallery/aws-region" --value "${AWS_REGION}" --type "String" --overwrite
aws ssm put-parameter --name "/photo-gallery/s3-bucket-name" --value "${S3_BUCKET_NAME}" --type "String" --overwrite
aws ssm put-parameter --name "/photo-gallery/api-url" --value "${NEXT_PUBLIC_API_URL}" --type "String" --overwrite

# Step 5: Create ECS Cluster if it doesn't exist
echo "Creating ECS Cluster if it doesn't exist..."
aws ecs describe-clusters --clusters ${ECS_CLUSTER} || \
aws ecs create-cluster --cluster-name ${ECS_CLUSTER}

# Step 6: Create CloudWatch Logs group if it doesn't exist
echo "Creating CloudWatch Logs group if it doesn't exist..."
aws logs describe-log-groups --log-group-name-prefix "/ecs/${TASK_FAMILY}" || \
aws logs create-log-group --log-group-name "/ecs/${TASK_FAMILY}"

# Step 7: Update the task definition with the new image URI
echo "Updating task definition file with the new image URI..."
sed -i "s|your-ecr-repo/next-photo-gallery:latest|${IMAGE_URI}|g" .aws/task-definition.json
sed -i "s|your-account-id|${AWS_ACCOUNT_ID}|g" .aws/task-definition.json

# Step 8: Register the updated task definition
echo "Registering the updated task definition..."
aws ecs register-task-definition --cli-input-json file://.aws/task-definition.json

# Step 9: Create or update the ECS service
echo "Creating or updating the ECS service..."
aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Creating new ECS service..."
  aws ecs create-service \
    --cluster ${ECS_CLUSTER} \
    --service-name ${ECS_SERVICE} \
    --task-definition ${TASK_FAMILY} \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"
else
  echo "Updating existing ECS service..."
  aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --task-definition ${TASK_FAMILY} \
    --desired-count 1
fi

echo "Deployment complete!"
echo "Note: You may need to update the subnet IDs and security group ID in the script for a new deployment."