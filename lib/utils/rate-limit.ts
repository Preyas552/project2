import { NextRequest } from 'next/server';
import { addLog } from './logs/logger';

interface RateLimitConfig {
  maxRequests: number;  // Maximum number of requests allowed
  windowMs: number;     // Time window in milliseconds
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,    // 100 requests
  windowMs: 900000,    // per 15 minutes
};

// Store rate limit data in memory
// In production, consider using Redis or a similar distributed store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitData(ip: string): { remaining: number; resetTime: number } | null {
  const now = Date.now();
  const data = rateLimitStore.get(ip);
  
  if (!data) return null;
  
  // Clean up expired entries
  if (now > data.resetTime) {
    rateLimitStore.delete(ip);
    return null;
  }
  
  return {
    remaining: Math.max(0, defaultConfig.maxRequests - data.count),
    resetTime: data.resetTime,
  };
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { isAllowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  let data = rateLimitStore.get(clientIp);
  
  // If no data exists or the window has expired, create new rate limit data
  if (!data || now > data.resetTime) {
    data = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  // Increment the counter
  data.count++;
  rateLimitStore.set(clientIp, data);
  
  const remaining = Math.max(0, config.maxRequests - data.count);
  const isAllowed = data.count <= config.maxRequests;
  
  if (!isAllowed) {
    addLog(`Rate limit exceeded for IP: ${clientIp}`, 'warn');
  }
  
  return {
    isAllowed,
    remaining,
    resetTime: data.resetTime,
  };
}