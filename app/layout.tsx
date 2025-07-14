import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '../components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Next.js Photo Gallery',
  description: 'A photo gallery application built with Next.js and AWS S3',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white dark:bg-gray-900 shadow-sm relative">
            <div className="container mx-auto px-4 py-3">
              <Navigation />
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
}