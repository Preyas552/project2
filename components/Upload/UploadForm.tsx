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
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleButtonClick = () => {
    if (!isPinVerified) {
      setShowPinDialog(true);
      return;
    }
    inputRef.current?.click();
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        setIsPinVerified(true);
        setShowPinDialog(false);
        inputRef.current?.click();
      } else {
        setPinError("Incorrect PIN");
        setPin("");
      }
    } catch (error) {
      setPinError("Failed to verify PIN");
      setPin("");
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPinVerified) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    const newFileStatuses: Record<string, FileStatus> = {};
    files.forEach(file => {
      newFileStatuses[file.name] = {
        fileName: file.name,
        progress: 0,
        status: "uploading"
      };
    });
    setFileStatuses(prev => ({ ...prev, ...newFileStatuses }));

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
        const errorMessage = err instanceof Error && err.message === 'Unauthorized' 
          ? "Session expired. Please verify PIN again."
          : "Upload failed";

        setFileStatuses(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: "error",
            message: errorMessage
          }
        }));

        if (err instanceof Error && err.message === 'Unauthorized') {
          setIsPinVerified(false);
        }
      }
    }));

    setUploading(false);
    e.target.value = '';

    // Clear successful uploads after 3 seconds
    setTimeout(() => {
      setFileStatuses(prev => {
        const newStatuses = { ...prev };
        Object.entries(newStatuses).forEach(([key, status]) => {
          if (status.status === 'success') {
            delete newStatuses[key];
          }
        });
        return newStatuses;
      });
    }, 3000);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      <button
        onClick={handleButtonClick}
        disabled={uploading}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors disabled:opacity-50"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
        </svg>
        Upload Photos
      </button>

      {/* File status notifications */}
      <div className="fixed bottom-4 right-4 w-80 space-y-2 z-50">
        {Object.values(fileStatuses).map((status) => (
          <div
            key={status.fileName}
            className={`rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 ${
              status.status === 'error' ? 'bg-red-50 border border-red-100' : 'bg-white'
            }`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate flex-1 text-gray-700">
                  {status.fileName}
                </span>
                {status.status === 'success' && (
                  <svg className="w-4 h-4 text-purple-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status.status === 'error' && (
                  <svg className="w-4 h-4 text-red-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-300 ${
                    status.status === 'error' ? 'bg-red-500' : 'bg-purple-600'
                  }`}
                  style={{
                    width: `${status.progress}%`
                  }}
                />
              </div>
              
              {status.message && (
                <span className={`text-xs mt-1.5 block ${
                  status.status === 'error' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {status.message}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PIN Dialog */}
      {showPinDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Enter PIN to Upload</h2>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter PIN"
                maxLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus
              />
              {pinError && (
                <p className="text-red-600 text-sm mb-4">{pinError}</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinDialog(false);
                    setPinError("");
                    setPin("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}