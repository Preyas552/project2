import { NextRequest, NextResponse } from 'next/server';
import { addLog } from '@/lib/utils/logs/logger';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { timingSafeEqual, createHash } from 'crypto';

// Strict rate limiting for PIN verification to prevent brute force
const PIN_RATE_LIMIT = {
  maxRequests: 10,    // 10 attempts
  windowMs: 900000,   // per 15 minutes
};

function hashPin(pin: string, secret: string): Buffer {
  return createHash('sha256')
    .update(pin + secret)
    .digest();
}

// Constant-time comparison to prevent timing attacks
function safeCompare(a: string, b: string, secret: string): boolean {
  const hashA = hashPin(a, secret);
  const hashB = hashPin(b, secret);
  
  try {
    return timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimit = checkRateLimit(request, PIN_RATE_LIMIT);
    
    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', PIN_RATE_LIMIT.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

    if (!rateLimit.isAllowed) {
      addLog('PIN verification rate limit exceeded', 'warn');
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { 
          status: 429,
          headers,
        }
      );
    }

    const data = await request.json();
    const { pin } = data;

    const uploadPin = process.env.UPLOAD_PIN;
    const pinSecret = process.env.PIN_SECRET_KEY;

    if (!uploadPin || !pinSecret) {
      addLog('Missing PIN configuration', 'error');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { 
          status: 500,
          headers,
        }
      );
    }

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { 
          status: 400,
          headers,
        }
      );
    }

    // Use constant-time comparison
    const isValid = safeCompare(pin, uploadPin, pinSecret);

    if (!isValid) {
      addLog('Invalid PIN attempt', 'warn');
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { 
          status: 403,
          headers,
        }
      );
    }

    addLog('Successful PIN verification');
    return NextResponse.json(
      { success: true },
      { headers }
    );
  } catch (error) {
    console.error('Error in verify-pin route:', error);
    addLog(`Error in verify-pin route: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}