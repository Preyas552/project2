import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  try {
    // Generate a unique file name
    const fileKey = `uploads/${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
    
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
      throw new Error('Failed to get upload URL');
    }

    const { presignedUrl } = await response.json();

    // Upload the file using the presigned URL
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
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(file);
    });
    
    return fileKey;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}