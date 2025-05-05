import { S3Client } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS configuration missing. Please check environment variables.');
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }
  
  return s3Client;
}