import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export type ImageItem = {
  key: string;
  url: string;
  lastModified: Date;
  size: number;
};

export async function listImages(prefix = 'uploads/', continuationToken?: string, limit = 20) {
  try {
    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME environment variable is not set');
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: limit,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    
    // Generate signed URLs for each object
    const items: ImageItem[] = await Promise.all(
      (response.Contents || []).map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key,
        });
        
        const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }); // URL valid for 1 hour
        
        return {
          key: item.Key || '',
          url,
          lastModified: item.LastModified || new Date(),
          size: item.Size || 0,
        };
      })
    );

    return {
      items,
      nextContinuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated,
    };
  } catch (error) {
    console.error('Error listing images from S3:', error);
    throw error;
  }
}