import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "./s3-client";

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  operation: 'get' | 'put' = 'put'
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error('S3_BUCKET_NAME environment variable is not set');
  }

  try {
    const s3Client = getS3Client();
    
    const command = operation === 'get'
      ? new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      : new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: contentType,
        });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}