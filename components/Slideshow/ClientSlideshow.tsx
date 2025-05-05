'use client';

import React, { useState } from 'react';
import SlideshowView from './SlideshowView';
import ControlBar from './ControlBar';
import { ImageItem } from '@/server-actions/list-images';

export default function ClientSlideshow({ images }: { images: ImageItem[] }) {
  const [isPlaying, setIsPlaying] = useState(true);
  
  console.log('ClientSlideshow received images:', images);

  // Map ImageItems to their URLs
  const imageUrls = images.map(img => img.url);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleFullscreen = () => {
    const element = document.querySelector('.slideshow-container');
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        element.requestFullscreen();
      }
    }
  };
  
  return (
    <div className="slideshow-container min-h-screen">
      <ControlBar 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onFullscreen={handleFullscreen}
      />
      <div className="w-full h-full flex items-center justify-center">
        <SlideshowView 
          images={imageUrls} 
          autoplay={isPlaying}
        />
      </div>
    </div>
  );
}