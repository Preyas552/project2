'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SlideshowViewProps {
  images: string[];
  autoplay?: boolean;
}

const SlideshowView: React.FC<SlideshowViewProps> = ({ images, autoplay = true }) => {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={10}
      slidesPerView={1}
      autoplay={autoplay ? { delay: 3000, disableOnInteraction: false } : false}
      pagination={{ clickable: true }}
      navigation
      className="h-full w-full"
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="relative aspect-video w-full">
            <img 
              src={image} 
              alt={`Slide ${index + 1}`} 
              className="object-contain w-full h-full"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SlideshowView;