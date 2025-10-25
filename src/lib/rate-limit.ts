// Rate Limiting Middleware for CuraFlow
// Protects against brute force attacks and DoS

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private getWindowStart(): number {
    return Math.floor(Date.now() / this.config.windowMs) * this.config.windowMs;
  }

  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(identifier);
    const now = Date.now();
    const windowStart = this.getWindowStart();
    const resetTime = windowStart + this.config.windowMs;

    if (!this.store[key] || this.store[key].resetTime < now) {
      // New window or expired entry
      this.store[key] = {
        count: 1,
        resetTime: resetTime
      };
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime
      };
    }

    if (this.store[key].count >= this.config.max) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime
      };
    }

    // Increment counter
    this.store[key].count++;
    return {
      allowed: true,
      remaining: this.config.max - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }
}

// Create rate limiter instances
const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

const fileUploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many file uploads, please try again later'
});

// Rate limiting middleware functions
export function checkAuthRateLimit(identifier: string) {
  return authRateLimiter.isAllowed(identifier);
}

export function checkApiRateLimit(identifier: string) {
  return apiRateLimiter.isAllowed(identifier);
}

export function checkFileUploadRateLimit(identifier: string) {
  return fileUploadRateLimiter.isAllowed(identifier);
}

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  let ip = 'unknown';
  
  if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  }
  
  return ip;
}

// Rate limiting response helper
export function createRateLimitResponse(message: string, resetTime: number) {
  return new Response(JSON.stringify({
    error: message,
    retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': resetTime.toString()
    }
  });
}

// Rate limiting decorator for API routes
export function withRateLimit(
  rateLimitType: 'auth' | 'api' | 'fileUpload' = 'api'
) {
  return function (handler: Function) {
    return async function (request: Request, ...args: any[]) {
      const identifier = getClientIdentifier(request);
      
      let rateLimitResult;
      switch (rateLimitType) {
        case 'auth':
          rateLimitResult = checkAuthRateLimit(identifier);
          break;
        case 'fileUpload':
          rateLimitResult = checkFileUploadRateLimit(identifier);
          break;
        default:
          rateLimitResult = checkApiRateLimit(identifier);
      }
      
      if (!rateLimitResult.allowed) {
        return createRateLimitResponse(
          rateLimitType === 'auth' 
            ? 'Too many login attempts, please try again later'
            : 'Too many requests, please try again later',
          rateLimitResult.resetTime
        );
      }
      
      // Add rate limit headers to response
      const response = await handler(request, ...args);
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', '100');
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
      }
      
      return response;
    };
  };
}

// Export rate limiters for direct use
export { authRateLimiter, apiRateLimiter, fileUploadRateLimiter };
