'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface SlideshowViewProps {
  images: string[];
  autoplay?: boolean;
}

const SlideshowView: React.FC<SlideshowViewProps> = ({ images, autoplay = true }) => {
  const [randomizedImages, setRandomizedImages] = useState<string[]>([]);
  
  console.log('SlideshowView received images:', images);
  console.log('Current randomizedImages state:', randomizedImages);

  useEffect(() => {
    if (images.length === 0) {
      console.log('Received empty images array');
      return;
    }

    // Fisher-Yates shuffle algorithm
    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const shuffled = shuffleArray(images);
    console.log('Shuffled images:', shuffled);
    setRandomizedImages(shuffled);
  }, [images]);

  if (randomizedImages.length === 0) {
    console.log('No images to display');
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          background-color: rgba(0, 0, 0, 0.5);
          padding: 2rem 1.5rem;
          color: white !important;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }

        .swiper-button-disabled {
          opacity: 0.35;
          pointer-events: none;
        }
      `}</style>
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={10}
        slidesPerView={1}
        autoplay={autoplay ? { delay: 3000, disableOnInteraction: false } : false}
        navigation={true}
        loop={true}
        className="h-full w-full"
      >
        {randomizedImages.map((image, index) => {
          console.log('Rendering slide with image:', image);
          return (
            <SwiperSlide key={`${image}-${index}`}>
              <div className="relative aspect-video w-full max-h-[70vh] flex items-center justify-center">
                <img 
                  src={image} 
                  alt={`Slide ${index + 1}`} 
                  className="object-contain w-full h-full"
                  onError={(e) => console.error('Image failed to load:', image, e)}
                  onLoad={() => console.log('Image loaded successfully:', image)}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default SlideshowView;