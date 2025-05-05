import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/aws/presigned-url';
import { addLog } from '@/lib/utils/logs/logger';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// Slightly more lenient rate limit for downloads
const DOWNLOAD_RATE_LIMIT = {
  maxRequests: 200,  // 200 downloads
  windowMs: 900000,  // per 15 minutes
};

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = checkRateLimit(request, DOWNLOAD_RATE_LIMIT);
    
    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', DOWNLOAD_RATE_LIMIT.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers,
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { 
          status: 400,
          headers,
        }
      );
    }

    // Validate key to prevent directory traversal
    if (key.includes('..') || !key.startsWith('uploads/')) {
      addLog(`Suspicious download attempt for key: ${key}`, 'warn');
      return NextResponse.json(
        { error: 'Invalid file key' },
        { 
          status: 400,
          headers,
        }
      );
    }

    const presignedUrl = await generatePresignedUrl(key, 'image/*', 'get');
    
    // Log the successful request
    addLog(`Generated download URL for ${key}`);

    return NextResponse.json(
      { presignedUrl },
      { headers }
    );
  } catch (error) {
    console.error('Error in download route:', error);
    addLog(`Error in download route: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}