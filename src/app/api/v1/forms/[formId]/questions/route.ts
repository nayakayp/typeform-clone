import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, questions, questionOptions } from "@/lib/db/schema";
import { eq, and, max } from "drizzle-orm";
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

// Question type values
const questionTypes = [
  "short_text", "long_text", "email", "phone", "number", "url", "date", "time",
  "multiple_choice", "checkboxes", "dropdown", "picture_choice", "yes_no",
  "rating", "opinion_scale", "nps", "ranking", "matrix",
  "file_upload", "signature", "video_recording", "audio_recording",
  "welcome_screen", "statement", "thank_you_screen", "redirect", "video_embed", "image_block",
  "payment", "calendly", "address", "legal", "captcha",
] as const;

// Create question schema
const createQuestionSchema = z.object({
  type: z.enum(questionTypes),
  title: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().max(255).optional(),
  required: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  validations: z.record(z.string(), z.unknown()).optional(),
  options: z.array(z.object({
    label: z.string().min(1).max(500),
    value: z.string().max(255).optional(),
    image: z.string().optional(),
  })).optional(),
});

// GET /api/v1/forms/:formId/questions - List questions
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

    const questionsList = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
      orderBy: (q, { asc }) => [asc(q.order)],
      with: {
        options: {
          orderBy: (o, { asc }) => [asc(o.order)],
        },
      },
    });

    const response = apiSuccess(questionsList);
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "questions:read" }
);

// POST /api/v1/forms/:formId/questions - Add question
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
      const parsed = createQuestionSchema.safeParse(body);

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

      // Get max order
      const [maxOrderResult] = await db
        .select({ maxOrder: max(questions.order) })
        .from(questions)
        .where(eq(questions.formId, formId));

      const newOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

      const { options: optionsData, ...questionData } = parsed.data;

      // Create question
      const [newQuestion] = await db
        .insert(questions)
        .values({
          formId,
          ...questionData,
          order: newOrder,
        })
        .returning();

      // Create options if provided
      if (optionsData && optionsData.length > 0) {
        await db.insert(questionOptions).values(
          optionsData.map((opt, idx) => ({
            questionId: newQuestion.id,
            label: opt.label,
            value: opt.value || opt.label,
            image: opt.image,
            order: idx,
          }))
        );
      }

      // Fetch the complete question with options
      const completeQuestion = await db.query.questions.findFirst({
        where: eq(questions.id, newQuestion.id),
        with: {
          options: {
            orderBy: (o, { asc }) => [asc(o.order)],
          },
        },
      });

      const response = apiSuccess(completeQuestion);
      response.headers.set("Location", `/api/v1/questions/${newQuestion.id}`);

      return addRateLimitHeaders(response, rateLimit.headers);
    } catch (error) {
      console.error("Error creating question:", error);
      return apiError("internal_error", "Failed to create question", 500);
    }
  },
  { permission: "questions:write" }
);
