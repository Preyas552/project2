import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { uploadImage } from '../../lib/aws/upload-image';
import ProgressIndicator from './ProgressIndicator';

interface FileWithPreview {
  file: File;
  preview: string;
}

const DropZone = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    for (const newFile of newFiles) {
      try {
        await uploadImage(newFile.file, (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [newFile.file.name]: progress,
          }));
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
      <div className="preview">
        {files.map((file) => (
          <div key={file.file.name}>
            <img src={file.preview} alt={file.file.name} width={100} />
            {uploadProgress[file.file.name] && (
              <ProgressIndicator progress={uploadProgress[file.file.name]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropZone;