import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { addLog } from './lib/utils/logs/logger'
import { checkRateLimit } from './lib/utils/rate-limit'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    // Get client identifier for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    
    if (!rateLimitResult.allowed) {
      addLog(`Rate limit exceeded for IP: ${clientIp}`, 'warn')
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0'
        }
      })
    }

    // Log API requests
    addLog(`API Request: ${request.method} ${pathname}`)

    // Validate content type for POST requests
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return new NextResponse('Invalid Content-Type', { status: 415 })
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}