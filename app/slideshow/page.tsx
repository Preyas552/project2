import { listImages } from '@/server-actions/list-images';
import ClientSlideshow from '../../components/Slideshow/ClientSlideshow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SlideshowPage() {
  const { items: images } = await listImages();
  console.log('Fetched images:', images);
  
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No images found in the gallery.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <ClientSlideshow images={images} />
    </div>
  );
}