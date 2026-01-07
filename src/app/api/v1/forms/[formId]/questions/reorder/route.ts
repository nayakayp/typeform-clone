import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, questions } from "@/lib/db/schema";
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

// Reorder schema
const reorderSchema = z.object({
  questionIds: z.array(z.string().uuid()),
});

// POST /api/v1/forms/:formId/questions/reorder - Reorder questions
export const POST = withApiAuth(
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

    try {
      const body = await request.json();
      const parsed = reorderSchema.safeParse(body);

      if (!parsed.success) {
        return apiError(
          "validation_error",
          "Invalid request body",
          400,
          { errors: parsed.error.flatten().fieldErrors }
        );
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

      const { questionIds } = parsed.data;

      // Update each question's order
      await Promise.all(
        questionIds.map((questionId, index) =>
          db
            .update(questions)
            .set({ order: index, updatedAt: new Date() })
            .where(
              and(
                eq(questions.id, questionId),
                eq(questions.formId, formId)
              )
            )
        )
      );

      // Fetch updated questions
      const updatedQuestions = await db.query.questions.findMany({
        where: eq(questions.formId, formId),
        orderBy: (q, { asc }) => [asc(q.order)],
        with: {
          options: {
            orderBy: (o, { asc }) => [asc(o.order)],
          },
        },
      });

      const response = apiSuccess(updatedQuestions);
      return addRateLimitHeaders(response, rateLimit.headers);
    } catch (error) {
      console.error("Error reordering questions:", error);
      return apiError("internal_error", "Failed to reorder questions", 500);
    }
  },
  { permission: "questions:write" }
);
