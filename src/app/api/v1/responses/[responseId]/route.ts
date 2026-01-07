import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, responses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  withApiAuth,
  apiSuccess,
  apiError,
  ApiAuthResult,
  checkApiRateLimit,
  addRateLimitHeaders,
  rateLimitError,
} from "@/lib/api";

// Helper to get response with workspace validation
async function getResponseWithValidation(
  responseId: string,
  workspaceId: string
) {
  const response = await db.query.responses.findFirst({
    where: eq(responses.id, responseId),
    with: {
      form: true,
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

  if (!response) {
    return { response: null, error: "Response not found" };
  }

  if (response.form.workspaceId !== workspaceId) {
    return { response: null, error: "Response not found" };
  }

  return { response, error: null };
}

// GET /api/v1/responses/:responseId - Get single response
export const GET = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const responseId = request.nextUrl.pathname.split("/").pop();
    if (!responseId) {
      return apiError("invalid_request", "Response ID is required", 400);
    }

    const { response: resp, error } = await getResponseWithValidation(
      responseId,
      auth.workspaceId
    );

    if (error) {
      return apiError("not_found", error, 404);
    }

    // Remove form from response (just include formId)
    const { form: _, ...responseData } = resp!;

    const apiResponse = apiSuccess(responseData);
    return addRateLimitHeaders(apiResponse, rateLimit.headers);
  },
  { permission: "responses:read" }
);

// DELETE /api/v1/responses/:responseId - Delete response
export const DELETE = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const responseId = request.nextUrl.pathname.split("/").pop();
    if (!responseId) {
      return apiError("invalid_request", "Response ID is required", 400);
    }

    const { response: existing, error } = await getResponseWithValidation(
      responseId,
      auth.workspaceId
    );

    if (error) {
      return apiError("not_found", error, 404);
    }

    await db.delete(responses).where(eq(responses.id, responseId));

    const apiResponse = apiSuccess({ deleted: true, id: responseId });
    return addRateLimitHeaders(apiResponse, rateLimit.headers);
  },
  { permission: "responses:delete" }
);
