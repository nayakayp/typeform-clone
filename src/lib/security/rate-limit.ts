import { headers } from "next/headers";

interface RateLimitConfig {
  requests: number;
  window: string; // e.g., "1m", "15m", "1h"
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// In-memory store (use Redis in production)
const store = new Map<string, { count: number; resetAt: number }>();

const defaultLimits: Record<string, RateLimitConfig> = {
  "POST /api/auth/login": { requests: 5, window: "15m" },
  "POST /api/auth/register": { requests: 3, window: "1h" },
  "POST /api/forms": { requests: 100, window: "1h" },
  "POST /api/responses": { requests: 1000, window: "1h" },
  "GET /api": { requests: 1000, window: "1m" },
  default: { requests: 100, window: "1m" },
};

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 60000; // Default 1 minute

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60000;
  }
}

/**
 * Get client IP address from request
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Check various headers (in order of preference)
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "127.0.0.1";
}

/**
 * Check rate limit for a given identifier
 */
export async function checkLimit(
  identifier: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const limit = config?.requests ?? 100;
  const windowMs = config ? parseWindow(config.window) : 60000;

  const now = Date.now();
  const key = identifier;

  // Get or create entry
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, limit - entry.count);
  const allowed = entry.count <= limit;

  return {
    allowed,
    remaining,
    reset: entry.resetAt,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
  request: Request,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;

  // Find matching config
  const endpoint = `${method} ${path}`;
  const config =
    customConfig ??
    defaultLimits[endpoint] ??
    defaultLimits[`${method} /api`] ??
    defaultLimits.default;

  // Check IP-based limit
  const result = await checkLimit(`ip:${ip}:${endpoint}`, config);

  return result;
}

/**
 * Apply rate limit and return error response if exceeded
 */
export async function applyRateLimit(
  request: Request,
  config?: RateLimitConfig
): Promise<Response | null> {
  const result = await rateLimit(request, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfter),
          "X-RateLimit-Limit": String(config?.requests ?? 100),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  return null;
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
