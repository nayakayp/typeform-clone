import { NextRequest, NextResponse } from "next/server";
import { checkLimit } from "@/lib/security/rate-limit";
import { ApiAuthResult, apiError } from "./auth";

// API rate limit configurations
export interface ApiRateLimitConfig {
  requests: number;
  window: string; // e.g., "1m", "15m", "1h"
}

// Default rate limits for API endpoints (can be customized per workspace/plan)
const defaultApiLimits: Record<string, ApiRateLimitConfig> = {
  // Form operations
  "GET /api/v1/forms": { requests: 100, window: "1m" },
  "POST /api/v1/forms": { requests: 30, window: "1m" },
  "PUT /api/v1/forms": { requests: 60, window: "1m" },
  "DELETE /api/v1/forms": { requests: 30, window: "1m" },

  // Question operations
  "GET /api/v1/questions": { requests: 200, window: "1m" },
  "POST /api/v1/questions": { requests: 100, window: "1m" },
  "PUT /api/v1/questions": { requests: 100, window: "1m" },
  "DELETE /api/v1/questions": { requests: 50, window: "1m" },

  // Response operations
  "GET /api/v1/responses": { requests: 100, window: "1m" },
  "DELETE /api/v1/responses": { requests: 30, window: "1m" },

  // Webhook operations
  "GET /api/v1/webhooks": { requests: 60, window: "1m" },
  "POST /api/v1/webhooks": { requests: 20, window: "1m" },
  "PUT /api/v1/webhooks": { requests: 30, window: "1m" },
  "DELETE /api/v1/webhooks": { requests: 20, window: "1m" },

  // Default
  default: { requests: 100, window: "1m" },
};

// Get rate limit config for an endpoint
function getApiRateLimitConfig(
  method: string,
  path: string
): ApiRateLimitConfig {
  // Normalize path - remove IDs to get base endpoint
  const normalizedPath = path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "/:id")
    .replace(/\/[^/]+$/, "/:id");

  const endpoint = `${method} ${normalizedPath}`;

  // Try exact match first
  if (defaultApiLimits[endpoint]) {
    return defaultApiLimits[endpoint];
  }

  // Try base path match
  const basePath = path.split("/").slice(0, 4).join("/");
  const baseEndpoint = `${method} ${basePath}`;
  if (defaultApiLimits[baseEndpoint]) {
    return defaultApiLimits[baseEndpoint];
  }

  return defaultApiLimits.default;
}

// Rate limit result with headers
export interface ApiRateLimitResult {
  allowed: boolean;
  headers: Record<string, string>;
  retryAfter?: number;
}

// Check rate limit for an authenticated API request
export async function checkApiRateLimit(
  request: NextRequest,
  auth: ApiAuthResult
): Promise<ApiRateLimitResult> {
  const url = new URL(request.url);
  const config = getApiRateLimitConfig(request.method, url.pathname);

  // Use workspace ID as the rate limit key
  const identifier = `api:${auth.workspaceId}:${request.method}:${url.pathname}`;

  const result = await checkLimit(identifier, config);

  return {
    allowed: result.allowed,
    headers: {
      "X-RateLimit-Limit": String(config.requests),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(result.reset),
      ...(result.retryAfter && { "Retry-After": String(result.retryAfter) }),
    },
    retryAfter: result.retryAfter,
  };
}

// Add rate limit headers to a response
export function addRateLimitHeaders(
  response: NextResponse,
  headers: Record<string, string>
): NextResponse {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

// Rate limit error response
export function rateLimitError(
  retryAfter: number,
  headers: Record<string, string>
): NextResponse {
  const response = apiError(
    "rate_limit_exceeded",
    "Too many requests. Please try again later.",
    429
  );

  return addRateLimitHeaders(response, headers);
}

// Middleware wrapper with rate limiting
export function withApiRateLimit(
  handler: (request: NextRequest, auth: ApiAuthResult) => Promise<NextResponse>,
  auth: ApiAuthResult
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const rateLimit = await checkApiRateLimit(request, auth);

    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const response = await handler(request, auth);
    return addRateLimitHeaders(response, rateLimit.headers);
  };
}
