import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, hasPermission } from "./keys";
import { ApiKey, ApiPermission } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { apiLogs } from "@/lib/db/schema";

// API authentication result
export interface ApiAuthResult {
  authenticated: true;
  apiKey: ApiKey;
  workspaceId: string;
  permissions: ApiPermission[];
}

export interface ApiAuthError {
  authenticated: false;
  error: string;
  code: string;
}

export type AuthResult = ApiAuthResult | ApiAuthError;

// Authenticate an API request
export async function authenticateApiRequest(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return {
      authenticated: false,
      error: "Missing Authorization header",
      code: "missing_auth",
    };
  }

  // Bearer token (API key)
  if (authHeader.startsWith("Bearer ")) {
    const key = authHeader.slice(7);
    const result = await validateApiKey(key);

    if (!result.valid) {
      return {
        authenticated: false,
        error: result.error,
        code: "invalid_key",
      };
    }

    return {
      authenticated: true,
      apiKey: result.apiKey,
      workspaceId: result.apiKey.workspaceId,
      permissions: result.apiKey.permissions as ApiPermission[],
    };
  }

  return {
    authenticated: false,
    error: "Invalid Authorization format. Use: Bearer <api_key>",
    code: "invalid_format",
  };
}

// Check if the authenticated key has a required permission
export function checkPermission(
  auth: ApiAuthResult,
  permission: ApiPermission
): boolean {
  return hasPermission(auth.apiKey, permission);
}

// API error response helper
export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

// API success response helper
export function apiSuccess<T>(
  data: T,
  meta?: {
    pagination?: {
      total: number;
      page: number;
      perPage: number;
      totalPages: number;
    };
  }
): NextResponse {
  return NextResponse.json({
    data,
    ...(meta && { meta }),
  });
}

// Log API request
export async function logApiRequest(params: {
  apiKeyId: string | null;
  workspaceId: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  userAgent?: string | null;
  ip?: string | null;
  error?: string | null;
}): Promise<void> {
  try {
    await db.insert(apiLogs).values({
      apiKeyId: params.apiKeyId,
      workspaceId: params.workspaceId,
      method: params.method,
      path: params.path,
      status: params.status,
      responseTime: params.responseTime,
      userAgent: params.userAgent || undefined,
      ip: params.ip || undefined,
      error: params.error || undefined,
    });
  } catch {
    // Ignore logging errors
    console.error("Failed to log API request");
  }
}

// Middleware wrapper that handles auth, permissions, and logging
export function withApiAuth(
  handler: (request: NextRequest, auth: ApiAuthResult) => Promise<NextResponse>,
  options: {
    permission?: ApiPermission;
  } = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const startTime = Date.now();

    // Authenticate
    const auth = await authenticateApiRequest(request);
    if (!auth.authenticated) {
      return apiError(auth.code, auth.error, 401);
    }

    // Check permission
    if (options.permission && !checkPermission(auth, options.permission)) {
      return apiError(
        "forbidden",
        `Missing required permission: ${options.permission}`,
        403
      );
    }

    try {
      const response = await handler(request, auth);

      // Log the request
      logApiRequest({
        apiKeyId: auth.apiKey.id,
        workspaceId: auth.workspaceId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: response.status,
        responseTime: Date.now() - startTime,
        userAgent: request.headers.get("User-Agent"),
        ip: request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP"),
      });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Log the error
      logApiRequest({
        apiKeyId: auth.apiKey.id,
        workspaceId: auth.workspaceId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: 500,
        responseTime: Date.now() - startTime,
        userAgent: request.headers.get("User-Agent"),
        ip: request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP"),
        error: errorMessage,
      });

      return apiError("internal_error", "An unexpected error occurred", 500);
    }
  };
}

// Parse pagination parameters from request
export function parsePagination(
  request: NextRequest
): { page: number; perPage: number; offset: number } {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("per_page") || "20", 10))
  );
  const offset = (page - 1) * perPage;

  return { page, perPage, offset };
}

// Build pagination metadata
export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number
): {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
} {
  return {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}
