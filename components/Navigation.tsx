"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between">
        <div className="flex-1 flex items-center justify-between w-full">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300">
            Photo Gallery
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link href="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
              Browse Gallery
            </Link>
            <Link href="/slideshow" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
              Slideshow
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="sm:hidden pt-2 pb-3 space-y-2">
          <Link
            href="/gallery"
            className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            Browse Gallery
          </Link>
          <Link
            href="/slideshow"
            className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            Slideshow
          </Link>
          <div className="px-3 py-2">
            <DarkModeToggle />
          </div>
        </div>
      )}
    </>
  );
}