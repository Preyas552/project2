import React from 'react';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Slideshow - Next.js Photo Gallery',
  description: 'Photo slideshow view',
};

export default function SlideshowLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} m-0 p-0 overflow-hidden`}>
        <div className="w-screen h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
