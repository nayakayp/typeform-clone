import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms, webhooks } from "@/lib/db/schema";
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
import { z } from "zod";

// Webhook events
const webhookEvents = [
  "response.created",
  "response.completed",
  "response.updated",
  "form.published",
  "form.closed",
] as const;

// Update webhook schema
const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum(webhookEvents)).optional(),
  isActive: z.boolean().optional(),
});

// Helper to get webhook with workspace validation
async function getWebhookWithValidation(
  webhookId: string,
  workspaceId: string
) {
  const webhook = await db.query.webhooks.findFirst({
    where: eq(webhooks.id, webhookId),
    with: {
      form: true,
    },
  });

  if (!webhook) {
    return { webhook: null, error: "Webhook not found" };
  }

  if (webhook.form.workspaceId !== workspaceId) {
    return { webhook: null, error: "Webhook not found" };
  }

  return { webhook, error: null };
}

// GET /api/v1/webhooks/:webhookId - Get single webhook
export const GET = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const webhookId = request.nextUrl.pathname.split("/").pop();
    if (!webhookId) {
      return apiError("invalid_request", "Webhook ID is required", 400);
    }

    const { webhook, error } = await getWebhookWithValidation(
      webhookId,
      auth.workspaceId
    );

    if (error) {
      return apiError("not_found", error, 404);
    }

    // Remove form and hide secret
    const { form: _, secret, ...webhookData } = webhook!;

    const apiResponse = apiSuccess({
      ...webhookData,
      hasSecret: !!secret,
    });
    return addRateLimitHeaders(apiResponse, rateLimit.headers);
  },
  { permission: "webhooks:read" }
);

// PUT /api/v1/webhooks/:webhookId - Update webhook
export const PUT = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const webhookId = request.nextUrl.pathname.split("/").pop();
    if (!webhookId) {
      return apiError("invalid_request", "Webhook ID is required", 400);
    }

    try {
      const body = await request.json();
      const parsed = updateWebhookSchema.safeParse(body);

      if (!parsed.success) {
        return apiError(
          "validation_error",
          "Invalid request body",
          400,
          { errors: parsed.error.flatten().fieldErrors }
        );
      }

      const { webhook: existing, error } = await getWebhookWithValidation(
        webhookId,
        auth.workspaceId
      );

      if (error) {
        return apiError("not_found", error, 404);
      }

      const [updated] = await db
        .update(webhooks)
        .set(parsed.data)
        .where(eq(webhooks.id, webhookId))
        .returning();

      // Hide secret
      const { secret, ...webhookData } = updated;

      const apiResponse = apiSuccess({
        ...webhookData,
        hasSecret: !!secret,
      });
      return addRateLimitHeaders(apiResponse, rateLimit.headers);
    } catch (error) {
      console.error("Error updating webhook:", error);
      return apiError("internal_error", "Failed to update webhook", 500);
    }
  },
  { permission: "webhooks:write" }
);

// DELETE /api/v1/webhooks/:webhookId - Delete webhook
export const DELETE = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const webhookId = request.nextUrl.pathname.split("/").pop();
    if (!webhookId) {
      return apiError("invalid_request", "Webhook ID is required", 400);
    }

    const { webhook: existing, error } = await getWebhookWithValidation(
      webhookId,
      auth.workspaceId
    );

    if (error) {
      return apiError("not_found", error, 404);
    }

    await db.delete(webhooks).where(eq(webhooks.id, webhookId));

    const apiResponse = apiSuccess({ deleted: true, id: webhookId });
    return addRateLimitHeaders(apiResponse, rateLimit.headers);
  },
  { permission: "webhooks:delete" }
);
