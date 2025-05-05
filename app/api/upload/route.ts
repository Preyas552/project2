import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/aws/presigned-url';
import { addLog } from '@/lib/utils/logs/logger';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// More strict rate limiting for uploads
const UPLOAD_RATE_LIMIT = {
  maxRequests: 50,   // 50 uploads
  windowMs: 900000,  // per 15 minutes
};

export async function POST(req: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = checkRateLimit(req, UPLOAD_RATE_LIMIT);
    
    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', UPLOAD_RATE_LIMIT.maxRequests.toString());
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

    const data = await req.json();
    const { fileName, fileType } = data;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { 
          status: 400,
          headers,
        }
      );
    }

    const presignedUrl = await generatePresignedUrl(fileName, fileType);
    
    // Log the successful request
    addLog(`Generated presigned URL for ${fileName}`);

    return NextResponse.json(
      { presignedUrl },
      { headers }
    );
  } catch (error) {
    console.error('Error in upload route:', error);
    addLog(`Error in upload route: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}