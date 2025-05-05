import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      process.env.S3_BUCKET_DOMAIN || '',
    ],
  },
  // Only expose necessary env variables to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Keep sensitive variables server-side only
  serverRuntimeConfig: {
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  },
};

export default nextConfig;
