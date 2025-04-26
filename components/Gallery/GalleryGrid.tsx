'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageItem } from '@/server-actions/list-images';
import { deleteImages } from '@/server-actions/delete-images';
import BulkActions from './BulkActions';

export default function GalleryGrid({ images }: { images: ImageItem[] }) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      // Deselect all if all are selected
      setSelectedImages(new Set());
    } else {
      // Select all
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
      
      if (result.success) {
        setDeleteMessage({ type: 'success', text: `Successfully deleted ${result.deleted} image(s)` });
        setSelectedImages(new Set());
        // Force refresh the page to show the updated gallery
        window.location.reload();
      } else {
        setDeleteMessage({ type: 'error', text: result.message || 'Failed to delete images' });
      }
    } catch (error) {
      setDeleteMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (images.length === 0) {
    return <div className="text-center py-12">No images found. Upload some photos to get started!</div>;
  }

  return (
    <div>
      {deleteMessage && (
        <div className={`mb-4 p-3 rounded ${deleteMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {deleteMessage.text}
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
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {images.map((image) => (
          <div 
            key={image.key} 
            className={`relative rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105 ${
              selectedImages.has(image.key) ? 'ring-2 ring-blue-500' : ''
            }`}
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
                {(image.size / 1024).toFixed(1)} KB
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