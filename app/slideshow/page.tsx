import { listImages } from '@/server-actions/list-images';
import ClientSlideshow from '../../components/Slideshow/ClientSlideshow';

export default async function SlideshowPage() {
  const { items: images } = await listImages();
  return <ClientSlideshow images={images} />;
}