import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { forms, webhooks } from "@/lib/db/schema";
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

// Webhook events
const webhookEvents = [
  "response.created",
  "response.completed",
  "response.updated",
  "form.published",
  "form.closed",
] as const;

// Create webhook schema
const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(webhookEvents)).default(["response.completed"]),
  isActive: z.boolean().default(true),
});

// GET /api/v1/forms/:formId/webhooks - List webhooks
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

    const webhooksList = await db.query.webhooks.findMany({
      where: eq(webhooks.formId, formId),
      orderBy: (w, { desc }) => [desc(w.createdAt)],
    });

    // Hide secrets from response
    const sanitizedWebhooks = webhooksList.map(({ secret, ...rest }) => ({
      ...rest,
      hasSecret: !!secret,
    }));

    const response = apiSuccess(sanitizedWebhooks);
    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "webhooks:read" }
);

// POST /api/v1/forms/:formId/webhooks - Create webhook
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
      const parsed = createWebhookSchema.safeParse(body);

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

      // Generate a secret for webhook signature verification
      const secret = randomBytes(32).toString("hex");

      const [newWebhook] = await db
        .insert(webhooks)
        .values({
          formId,
          url: parsed.data.url,
          events: parsed.data.events,
          isActive: parsed.data.isActive,
          secret,
        })
        .returning();

      // Return webhook with secret (only shown once)
      const response = apiSuccess({
        ...newWebhook,
        secret, // Include secret in creation response (only time it's shown)
      });
      response.headers.set("Location", `/api/v1/webhooks/${newWebhook.id}`);

      return addRateLimitHeaders(response, rateLimit.headers);
    } catch (error) {
      console.error("Error creating webhook:", error);
      return apiError("internal_error", "Failed to create webhook", 500);
    }
  },
  { permission: "webhooks:write" }
);
