"use client";
import React from 'react';
import UploadForm from '../components/Upload/UploadForm';

async function HomePage() {
  return (
    <>
      <div className="fixed top-2 right-4 z-50">
        <UploadForm />
      </div>
      <div className="container mx-auto p-4 max-w-2xl min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-sm p-6 mt-16">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Photos</h2>
          <p className="text-gray-600 mb-6">
            Drop your photos here or click to browse. Supported formats: JPEG, PNG
          </p>
          {/* You can add more content here if needed */}
        </div>
      </div>
    </>
  );
}

export default HomePage;