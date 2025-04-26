import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function deleteImages(keys: string[]) {
  if (!keys.length) return { success: false, message: 'No keys provided' };

  try {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    const response = await s3Client.send(command);
    
    return {
      success: true,
      deleted: response.Deleted?.length || 0,
      errors: response.Errors || [],
    };
  } catch (error) {
    console.error('Error deleting images from S3:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}