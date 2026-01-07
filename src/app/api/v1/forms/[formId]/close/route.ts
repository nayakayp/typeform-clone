import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  withApiAuth,
  apiSuccess,
  apiError,
  ApiAuthResult,
  checkApiRateLimit,
  addRateLimitHeaders,
  rateLimitError,
} from "@/lib/api";

// POST /api/v1/forms/:formId/close - Close a form
export const POST = withApiAuth(
  async (
    request: NextRequest,
    auth: ApiAuthResult
  ) => {
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

    // Check if form exists and belongs to workspace
    const form = await db.query.forms.findFirst({
      where: and(
        eq(forms.id, formId),
        eq(forms.workspaceId, auth.workspaceId)
      ),
    });

    if (!form) {
      return apiError("not_found", "Form not found", 404);
    }

    // Check if already closed
    if (form.status === "closed") {
      return apiError("already_closed", "Form is already closed", 400);
    }

    const [updated] = await db
      .update(forms)
      .set({
        status: "closed",
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(forms.id, formId))
      .returning();

    const response = apiSuccess({
      ...updated,
      message: "Form closed successfully",
    });
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "forms:write" }
);
