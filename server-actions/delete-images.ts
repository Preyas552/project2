import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { addLog } from '@/lib/utils/logger';
import { getS3Client } from '../lib/aws/s3-client';

export async function deleteImages(keys: string[]) {
  addLog('Starting delete operation');
  
  if (!keys.length) {
    addLog('No keys provided for deletion');
    return { success: false, message: 'No keys provided' };
  }

  // Check environment variables
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  addLog(`Environment check: Region=${region}, Bucket=${bucketName}`);
  addLog(`AWS credentials present: ${!!accessKeyId && !!secretAccessKey}`);

  if (!bucketName) {
    addLog('ERROR: S3_BUCKET_NAME environment variable is not set');
    return { success: false, message: 'S3 bucket configuration is missing' };
  }

  if (!region || !accessKeyId || !secretAccessKey) {
    addLog('ERROR: AWS credentials or region missing');
    return { success: false, message: 'AWS configuration is incomplete' };
  }

  try {
    const s3Client = getS3Client();
    addLog(`Attempting to delete ${keys.length} objects from bucket ${bucketName}`);
    
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    addLog('Sending delete command to S3...');
    const response = await s3Client.send(command);
    
    if (response.Errors && response.Errors.length > 0) {
      addLog(`Delete operation completed with ${response.Errors.length} errors`);
      addLog(`Error details: ${JSON.stringify(response.Errors)}`);
      return {
        success: false,
        message: 'Some images failed to delete',
        errors: response.Errors
      };
    }
    
    addLog(`Successfully deleted ${response.Deleted?.length || 0} objects`);
    return {
      success: true,
      deleted: response.Deleted?.length || 0,
      errors: [],
    };
  } catch (error) {
    addLog(`ERROR during deletion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (error instanceof Error) {
      addLog(`Error stack: ${error.stack}`);
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}