import { v4 as uuidv4 } from 'uuid';
import { validateFile } from '../utils/file-validation';
import { addLog } from '../utils/logs/logger';

export async function uploadImage(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  try {
    // Validate file before proceeding
    const validationResult = await validateFile(file);
    if (!validationResult.valid) {
      throw new Error(validationResult.message || 'Invalid file');
    }

    // Use sanitized filename and add UUID to ensure uniqueness
    const sanitizedName = validationResult.sanitizedName || file.name;
    const fileKey = `uploads/${uuidv4()}-${sanitizedName}`;
    
    // Get presigned URL from our API
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: fileKey,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get upload URL');
    }

    const { presignedUrl } = await response.json();

    // Upload the file using the presigned URL with progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    
    if (progressCallback) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          progressCallback(progress);
        }
      };
    }
    
    await new Promise<void>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          addLog(`Successfully uploaded ${fileKey}`);
          resolve();
        } else {
          const error = `Upload failed with status: ${xhr.status}`;
          addLog(error, 'error');
          reject(new Error(error));
        }
      };
      xhr.onerror = () => {
        const error = 'Network error during upload';
        addLog(error, 'error');
        reject(new Error(error));
      };
      xhr.send(file);
    });
    
    return fileKey;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during upload';
    addLog(errorMessage, 'error');
    throw error;
  }
}