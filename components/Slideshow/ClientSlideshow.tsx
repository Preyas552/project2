'use client';

import React, { useState } from 'react';
import SlideshowView from './SlideshowView';
import ControlBar from './ControlBar';
import { ImageItem } from '@/server-actions/list-images';

export default function ClientSlideshow({ images }: { images: ImageItem[] }) {
  const [isPlaying, setIsPlaying] = useState(true);
  
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
    <div className="slideshow-container">
      <ControlBar 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onFullscreen={handleFullscreen}
      />
      <SlideshowView 
        images={images.map(img => img.url)} 
        autoplay={isPlaying}
      />
    </div>
  );
}