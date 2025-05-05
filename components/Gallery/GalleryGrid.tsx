'use client';

import { useState } from 'react';
import { ImageItem } from '@/server-actions/list-images';
import { deleteImages } from '@/server-actions/delete-images';
import BulkActions from './BulkActions';
import { formatFileSize } from '@/lib/utils/file-validation';

interface ModalProps {
  image: ImageItem;
  onClose: () => void;
}

const ImageModal: React.FC<ModalProps> = ({ image, onClose }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Use the new download endpoint
      window.location.href = `/api/download?key=${encodeURIComponent(image.key)}`;
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full">
        <div 
          className="bg-white rounded-lg p-4"
          onClick={e => e.stopPropagation()}
        >
          <img
            src={image.url}
            alt={image.key.split('/').pop() || 'Image'}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-700">{image.key.split('/').pop()}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GalleryGrid({ images }: { images: ImageItem[] }) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [modalImage, setModalImage] = useState<ImageItem | null>(null);

  const fetchDebugLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setDebugLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const toggleSelection = (key: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedImages(newSelection);
  };

  const selectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.key)));
    }
  };

  const handleDelete = async () => {
    if (selectedImages.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.size} selected image(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await deleteImages(Array.from(selectedImages));
      
      // Fetch logs after delete operation
      await fetchDebugLogs();
      
      if (result.success) {
        setDeleteMessage({ type: 'success', text: `Successfully deleted ${result.deleted} image(s)` });
        setSelectedImages(new Set());
        window.location.reload();
      } else {
        setDeleteMessage({ 
          type: 'error', 
          text: `Failed to delete images: ${result.message}` 
        });
      }
    } catch (error) {
      await fetchDebugLogs();
      setDeleteMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageClick = (image: ImageItem, e: React.MouseEvent) => {
    // Prevent opening modal when clicking checkbox
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    setModalImage(image);
  };

  if (images.length === 0) {
    return <div className="text-center py-12">No images found. Upload some photos to get started!</div>;
  }

  return (
    <div>
      {modalImage && <ImageModal image={modalImage} onClose={() => setModalImage(null)} />}
      {deleteMessage && (
        <div className={`mb-4 p-3 rounded ${deleteMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {deleteMessage.text}
          {deleteMessage.type === 'error' && debugLogs.length > 0 && (
            <div className="mt-2">
              <details>
                <summary className="cursor-pointer font-semibold">Show Debug Logs</summary>
                <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                  {debugLogs.join('\n')}
                </pre>
              </details>
            </div>
          )}
          <button 
            className="ml-2 font-bold"
            onClick={() => setDeleteMessage(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <BulkActions 
        selectedCount={selectedImages.size}
        totalCount={images.length}
        onSelectAll={selectAll}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        selectedImages={selectedImages}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {images.map((image) => (
          <div 
            key={image.key} 
            className={`relative rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105 cursor-pointer ${
              selectedImages.has(image.key) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={(e) => handleImageClick(image, e)}
          >
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={image.url}
                alt={image.key.split('/').pop() || 'Image'}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
            
            <div className="p-2 bg-white">
              <p className="truncate text-sm">{image.key.split('/').pop()}</p>
              <p className="text-xs text-gray-500">
                {new Date(image.lastModified).toLocaleDateString()} • 
                {formatFileSize(image.size)}
              </p>
            </div>
            
            <input
              type="checkbox"
              checked={selectedImages.has(image.key)}
              onChange={() => toggleSelection(image.key)}
              className="absolute top-2 right-2 h-5 w-5 z-10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}