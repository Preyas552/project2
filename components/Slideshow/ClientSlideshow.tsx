'use client';

import React, { useState, useEffect } from 'react';
import SlideshowView from './SlideshowView';
import ControlBar from './ControlBar';
import { ImageItem } from '@/server-actions/list-images';

export default function ClientSlideshow({ images }: { images: ImageItem[] }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    const element = document.querySelector('.slideshow-container');
    if (element && !document.fullscreenElement) {
      element.requestFullscreen();
    }
  };

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="slideshow-container relative w-full h-screen overflow-hidden">
      <SlideshowView 
        images={images.map(img => img.url)} 
        autoplay={isPlaying}
      />
      <ControlBar 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        isFullscreen={isFullscreen}
        onFullscreen={handleFullscreen}
        onExitFullscreen={handleExitFullscreen}
      />
    </div>
  );
}