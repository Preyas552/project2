// app/gallery/page.tsx
import { Suspense } from 'react';
import GalleryGrid from '@/components/Gallery/GalleryGrid';
import { listImages } from '@/server-actions/list-images';

export const dynamic = 'force-dynamic';

interface SearchParams {
  token?: string;
  limit?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
  params: Record<string, string | string[]>;
}

export default async function GalleryPage({ searchParams, params }: PageProps) {
  // Await searchParams before destructuring
  const resolvedParams = await searchParams;
  const { token, limit: limitStr } = resolvedParams;
  const limit = limitStr ? parseInt(limitStr, 10) : 20;

  const { items, nextContinuationToken, isTruncated } = await listImages(
    'uploads/',
    token,
    limit,
  );

  return (
    <div className="container mx-auto px-4 py-8">
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

        {isTruncated && (
          <div className="mt-8 text-center">
            <a
              href={`/gallery?token=${encodeURIComponent(nextContinuationToken ?? '')}`}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <span>Load More</span>
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 9l-7 7-7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
