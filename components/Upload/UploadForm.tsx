"use client";
import React, { useRef, useState } from "react";
import { uploadImage } from "../../lib/aws/upload-image";

interface FileStatus {
  fileName: string;
  progress: number;
  status: "uploading" | "success" | "error";
  message?: string;
}

export default function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const [uploading, setUploading] = useState(false);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    // Initialize status for each file
    const newFileStatuses: Record<string, FileStatus> = {};
    files.forEach(file => {
      newFileStatuses[file.name] = {
        fileName: file.name,
        progress: 0,
        status: "uploading"
      };
    });
    setFileStatuses(prev => ({ ...prev, ...newFileStatuses }));

    // Upload each file
    await Promise.all(files.map(async (file) => {
      try {
        await uploadImage(file, (progress) => {
          setFileStatuses(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              progress
            }
          }));
        });
        
        setFileStatuses(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: "success",
            message: "Upload complete"
          }
        }));
      } catch (err) {
        setFileStatuses(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: "error",
            message: "Upload failed"
          }
        }));
      }
    }));

    setUploading(false);
    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    // Clear statuses after a delay
    setTimeout(() => {
      setFileStatuses({});
    }, 3000);
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleChange}
        multiple
      />
      <div className="relative group">
        <button
          type="button"
          onClick={handleButtonClick}
          className={`w-9 h-9 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow transition-all duration-150 ${uploading ? "opacity-70 cursor-wait" : ""}`}
          aria-label="Upload photos"
          disabled={uploading}
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
          </svg>
        </button>
        <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-20 whitespace-nowrap">
          Upload photos
        </span>
      </div>
      
      {/* Progress indicators */}
      <div className="fixed top-4 right-16 space-y-2">
        {Object.values(fileStatuses).map((status) => (
          <div
            key={status.fileName}
            className={`flex items-center space-x-2 bg-white rounded-lg shadow-md p-2 text-sm ${
              status.status === 'error' ? 'text-red-600' : 
              status.status === 'success' ? 'text-green-600' : 
              'text-gray-600'
            }`}
          >
            <div className="w-32">
              <div className="truncate">{status.fileName}</div>
              {status.status === 'uploading' && (
                <div className="h-1 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              )}
            </div>
            {status.message && <span>{status.message}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}