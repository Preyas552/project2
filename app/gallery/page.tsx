import { Suspense } from 'react';
import GalleryGrid from '@/components/Gallery/GalleryGrid';
import { listImages } from '@/server-actions/list-images';
import UploadForm from '@/components/Upload/UploadForm';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const { items } = await listImages();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Photo Gallery</h1>
        <UploadForm />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          }
        >
          <GalleryGrid images={items} />
        </Suspense>
      </div>
    </div>
  );
}