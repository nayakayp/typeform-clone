import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, questions, questionOptions } from "@/lib/db/schema";
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

// Update question schema
const updateQuestionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().max(255).optional(),
  required: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
  validations: z.record(z.unknown()).optional(),
  options: z.array(z.object({
    id: z.string().uuid().optional(), // Existing option ID
    label: z.string().min(1).max(500),
    value: z.string().max(255).optional(),
    image: z.string().optional(),
  })).optional(),
});

// Helper to get question with workspace validation
async function getQuestionWithValidation(
  questionId: string,
  workspaceId: string
) {
  const question = await db.query.questions.findFirst({
    where: eq(questions.id, questionId),
    with: {
      form: true,
      options: {
        orderBy: (o, { asc }) => [asc(o.order)],
      },
    },
  });

  if (!question) {
    return { question: null, error: "Question not found" };
  }

  if (question.form.workspaceId !== workspaceId) {
    return { question: null, error: "Question not found" };
  }

  return { question, error: null };
}

// GET /api/v1/questions/:questionId - Get single question
export const GET = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const questionId = request.nextUrl.pathname.split("/").pop();
    if (!questionId) {
      return apiError("invalid_request", "Question ID is required", 400);
    }

    const { question, error } = await getQuestionWithValidation(
      questionId,
      auth.workspaceId
    );

    if (error) {
      return apiError("not_found", error, 404);
    }

    // Remove form from response
    const { form: _, ...questionData } = question!;

    const response = apiSuccess(questionData);
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "questions:read" }
);

// PUT /api/v1/questions/:questionId - Update question
export const PUT = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const questionId = request.nextUrl.pathname.split("/").pop();
    if (!questionId) {
      return apiError("invalid_request", "Question ID is required", 400);
    }

    try {
      const body = await request.json();
      const parsed = updateQuestionSchema.safeParse(body);

      if (!parsed.success) {
        return apiError(
          "validation_error",
          "Invalid request body",
          400,
          { errors: parsed.error.flatten().fieldErrors }
        );
      }

      const { question: existing, error } = await getQuestionWithValidation(
        questionId,
        auth.workspaceId
      );

      if (error) {
        return apiError("not_found", error, 404);
      }

      const { options: optionsData, ...questionData } = parsed.data;

      // Update question
      const [updated] = await db
        .update(questions)
        .set({
          ...questionData,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, questionId))
        .returning();

      // Update options if provided
      if (optionsData !== undefined) {
        // Delete existing options
        await db
          .delete(questionOptions)
          .where(eq(questionOptions.questionId, questionId));

        // Insert new options
        if (optionsData.length > 0) {
          await db.insert(questionOptions).values(
            optionsData.map((opt, idx) => ({
              questionId,
              label: opt.label,
              value: opt.value || opt.label,
              image: opt.image,
              order: idx,
            }))
          );
        }
      }

      // Fetch complete updated question
      const completeQuestion = await db.query.questions.findFirst({
        where: eq(questions.id, questionId),
        with: {
          options: {
            orderBy: (o, { asc }) => [asc(o.order)],
          },
        },
      });

      const response = apiSuccess(completeQuestion);
      return addRateLimitHeaders(response, rateLimit.headers);
    } catch (error) {
      console.error("Error updating question:", error);
      return apiError("internal_error", "Failed to update question", 500);
    }
  },
  { permission: "questions:write" }
);

// DELETE /api/v1/questions/:questionId - Delete question
export const DELETE = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const questionId = request.nextUrl.pathname.split("/").pop();
    if (!questionId) {
      return apiError("invalid_request", "Question ID is required", 400);
    }

    const { question: existing, error } = await getQuestionWithValidation(
      questionId,
      auth.workspaceId
    );

    if (error) {
      return apiError("not_found", error, 404);
    }

    await db.delete(questions).where(eq(questions.id, questionId));

    const response = apiSuccess({ deleted: true, id: questionId });
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "questions:delete" }
);
