import React from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import DarkModeToggle from '../components/DarkModeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Next.js Photo Gallery',
  description: 'A photo gallery application built with Next.js and AWS S3',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white dark:bg-gray-900 shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center justify-between">
                <div className="flex-1 flex items-center space-x-8">
                  <Link href="/" className="text-xl font-bold text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300">
                    Photo Gallery
                  </Link>
                  <div className="hidden sm:flex space-x-6">
                    <Link href="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                      Browse Gallery
                    </Link>
                    <Link href="/slideshow" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                      Slideshow
                    </Link>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DarkModeToggle />
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-grow bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-6">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Next.js Photo Gallery. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default Layout;