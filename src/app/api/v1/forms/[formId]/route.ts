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
import { z } from "zod";

// Update form schema
const updateFormSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  isPublic: z.boolean().optional(),
  maxResponses: z.number().int().positive().nullable().optional(),
  closeAt: z.string().datetime().nullable().optional(),
  openAt: z.string().datetime().nullable().optional(),
});

// GET /api/v1/forms/:formId - Get single form
export const GET = withApiAuth(
  async (
    request: NextRequest,
    auth: ApiAuthResult
  ) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const formId = request.nextUrl.pathname.split("/").pop();
    if (!formId) {
      return apiError("invalid_request", "Form ID is required", 400);
    }

    const form = await db.query.forms.findFirst({
      where: and(
        eq(forms.id, formId),
        eq(forms.workspaceId, auth.workspaceId)
      ),
      with: {
        questions: {
          orderBy: (q, { asc }) => [asc(q.order)],
          with: {
            options: {
              orderBy: (o, { asc }) => [asc(o.order)],
            },
          },
        },
      },
    });

    if (!form) {
      return apiError("not_found", "Form not found", 404);
    }

    const response = apiSuccess(form);
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "forms:read" }
);

// PUT /api/v1/forms/:formId - Update form
export const PUT = withApiAuth(
  async (
    request: NextRequest,
    auth: ApiAuthResult
  ) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const formId = request.nextUrl.pathname.split("/").pop();
    if (!formId) {
      return apiError("invalid_request", "Form ID is required", 400);
    }

    try {
      const body = await request.json();
      const parsed = updateFormSchema.safeParse(body);

      if (!parsed.success) {
        return apiError(
          "validation_error",
          "Invalid request body",
          400,
          { errors: parsed.error.flatten().fieldErrors }
        );
      }

      // Build update object
      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (parsed.data.title !== undefined) updates.title = parsed.data.title;
      if (parsed.data.description !== undefined) updates.description = parsed.data.description;
      if (parsed.data.settings !== undefined) updates.settings = parsed.data.settings;
      if (parsed.data.isPublic !== undefined) updates.isPublic = parsed.data.isPublic;
      if (parsed.data.maxResponses !== undefined) updates.maxResponses = parsed.data.maxResponses;
      if (parsed.data.closeAt !== undefined) updates.closeAt = parsed.data.closeAt ? new Date(parsed.data.closeAt) : null;
      if (parsed.data.openAt !== undefined) updates.openAt = parsed.data.openAt ? new Date(parsed.data.openAt) : null;

      const [updated] = await db
        .update(forms)
        .set(updates)
        .where(
          and(
            eq(forms.id, formId),
            eq(forms.workspaceId, auth.workspaceId)
          )
        )
        .returning();

      if (!updated) {
        return apiError("not_found", "Form not found", 404);
      }

      const response = apiSuccess(updated);
      return addRateLimitHeaders(response, rateLimit.headers);
    } catch (error) {
      console.error("Error updating form:", error);
      return apiError("internal_error", "Failed to update form", 500);
    }
  },
  { permission: "forms:write" }
);

// DELETE /api/v1/forms/:formId - Delete form
export const DELETE = withApiAuth(
  async (
    request: NextRequest,
    auth: ApiAuthResult
  ) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const formId = request.nextUrl.pathname.split("/").pop();
    if (!formId) {
      return apiError("invalid_request", "Form ID is required", 400);
    }

    const [deleted] = await db
      .delete(forms)
      .where(
        and(
          eq(forms.id, formId),
          eq(forms.workspaceId, auth.workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      return apiError("not_found", "Form not found", 404);
    }

    const response = apiSuccess({ deleted: true, id: formId });
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "forms:delete" }
);
