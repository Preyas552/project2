import React from 'react';

interface ControlBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  isFullscreen: boolean;
  onFullscreen: () => void;
  onExitFullscreen: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ isPlaying, onPlayPause, isFullscreen, onFullscreen, onExitFullscreen }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-center space-x-4 z-50">
      <button
        onClick={onPlayPause}
        className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        {isPlaying ? (
            <>
            <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
            <span className="text-black">Pause</span>
            </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            <span className="text-black">Play</span>
          </>
        )}
      </button>
      <button
        onClick={isFullscreen ? onExitFullscreen : onFullscreen}
        className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        {isFullscreen ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 16v2a2 2 0 01-2 2h-2m-8-20H6a2 2 0 00-2 2v2m0 12v2a2 2 0 002 2h2" />
            </svg>
            <span className="text-black">Exit Fullscreen</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-20h2a2 2 0 012 2v2m0 12v2a2 2 0 01-2 2h-2" />
            </svg>
            <span className="text-black">Fullscreen</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ControlBar;
