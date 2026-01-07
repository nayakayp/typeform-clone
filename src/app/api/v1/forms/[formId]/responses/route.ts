import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, responses } from "@/lib/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import {
  withApiAuth,
  apiSuccess,
  apiError,
  parsePagination,
  buildPaginationMeta,
  ApiAuthResult,
  checkApiRateLimit,
  addRateLimitHeaders,
  rateLimitError,
} from "@/lib/api";

// GET /api/v1/forms/:formId/responses - List responses
export const GET = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    // Extract formId from URL
    const pathParts = request.nextUrl.pathname.split("/");
    const formId = pathParts[pathParts.indexOf("forms") + 1];

    if (!formId) {
      return apiError("invalid_request", "Form ID is required", 400);
    }

    // Verify form belongs to workspace
    const form = await db.query.forms.findFirst({
      where: and(
        eq(forms.id, formId),
        eq(forms.workspaceId, auth.workspaceId)
      ),
    });

    if (!form) {
      return apiError("not_found", "Form not found", 404);
    }

    const { page, perPage, offset } = parsePagination(request);
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // in_progress, completed, partial

    // Build where clause
    const whereClause = status
      ? and(
          eq(responses.formId, formId),
          eq(responses.status, status)
        )
      : eq(responses.formId, formId);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(responses)
      .where(whereClause);

    const total = totalResult?.count || 0;

    // Get responses
    const responsesList = await db.query.responses.findMany({
      where: whereClause,
      orderBy: (r, { desc }) => [desc(r.createdAt)],
      limit: perPage,
      offset,
      with: {
        answers: {
          with: {
            question: {
              columns: {
                id: true,
                type: true,
                title: true,
              },
            },
          },
        },
      },
    });

    const response = apiSuccess(responsesList, {
      pagination: buildPaginationMeta(total, page, perPage),
    });

    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "responses:read" }
);
