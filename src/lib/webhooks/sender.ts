import { createHmac } from "crypto";
import { db } from "@/lib/db";
import {
  webhooks,
  webhookLogs,
  Webhook,
  WebhookEvent,
  forms,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Webhook payload structure
export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    formId: string;
    formTitle: string;
    response?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

// Webhook delivery result
export interface DeliveryResult {
  success: boolean;
  status: number;
  responseBody?: string;
  error?: string;
  duration: number;
}

// Create HMAC signature for webhook payload
export function createSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// Verify webhook signature
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createSignature(payload, secret);
  return signature === expectedSignature;
}

// Send a webhook
export async function sendWebhook(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<DeliveryResult> {
  const startTime = Date.now();
  const payloadString = JSON.stringify(payload);

  // Create signature if secret exists
  const signature = webhook.secret
    ? createSignature(payloadString, webhook.secret)
    : undefined;

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature || "",
        "X-Webhook-Event": payload.event,
        "X-Webhook-Timestamp": payload.timestamp,
      },
      body: payloadString,
      // Timeout after 30 seconds
      signal: AbortSignal.timeout(30000),
    });

    const responseBody = await response.text();
    const duration = Date.now() - startTime;

    // Log the delivery
    await logWebhookDelivery(webhook.id, {
      event: payload.event,
      payload,
      status: response.status,
      responseBody: responseBody.slice(0, 1000), // Limit stored response
      duration,
    });

    return {
      success: response.ok,
      status: response.status,
      responseBody: responseBody.slice(0, 1000),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Log the failed delivery
    await logWebhookDelivery(webhook.id, {
      event: payload.event,
      payload,
      status: 0,
      error: errorMessage,
      duration,
    });

    return {
      success: false,
      status: 0,
      error: errorMessage,
      duration,
    };
  }
}

// Log webhook delivery
async function logWebhookDelivery(
  webhookId: string,
  data: {
    event: string;
    payload: WebhookPayload;
    status: number;
    responseBody?: string;
    error?: string;
    duration: number;
  }
): Promise<void> {
  try {
    await db.insert(webhookLogs).values({
      webhookId,
      event: data.event,
      payload: data.payload as unknown as Record<string, unknown>,
      responseStatus: data.status,
      responseBody: data.responseBody,
      error: data.error,
    });
  } catch (error) {
    console.error("Failed to log webhook delivery:", error);
  }
}

// Get active webhooks for a form event
export async function getWebhooksForEvent(
  formId: string,
  event: WebhookEvent
): Promise<Webhook[]> {
  const formWebhooks = await db.query.webhooks.findMany({
    where: and(eq(webhooks.formId, formId), eq(webhooks.isActive, true)),
  });

  // Filter by event
  return formWebhooks.filter((webhook) => {
    const events = webhook.events as WebhookEvent[];
    return events.includes(event);
  });
}

// Trigger webhooks for a form event
export async function triggerWebhooks(
  formId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<{ total: number; successful: number; failed: number }> {
  // Get form details
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  if (!form) {
    return { total: 0, successful: 0, failed: 0 };
  }

  // Get active webhooks for this event
  const activeWebhooks = await getWebhooksForEvent(formId, event);

  if (activeWebhooks.length === 0) {
    return { total: 0, successful: 0, failed: 0 };
  }

  // Build payload
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      formId,
      formTitle: form.title,
      ...data,
    },
  };

  // Send webhooks in parallel
  const results = await Promise.all(
    activeWebhooks.map((webhook) => sendWebhook(webhook, payload))
  );

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return { total: activeWebhooks.length, successful, failed };
}

// Get webhook logs
export async function getWebhookLogs(
  webhookId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<Array<{
  id: string;
  event: string;
  responseStatus: number | null;
  error: string | null;
  createdAt: Date;
}>> {
  const { limit = 20, offset = 0 } = options;

  return db.query.webhookLogs.findMany({
    where: eq(webhookLogs.webhookId, webhookId),
    orderBy: [desc(webhookLogs.createdAt)],
    limit,
    offset,
    columns: {
      id: true,
      event: true,
      responseStatus: true,
      error: true,
      createdAt: true,
    },
  });
}

// Retry a failed webhook
export async function retryWebhook(
  webhookId: string,
  logId: string
): Promise<DeliveryResult | null> {
  // Get the webhook
  const webhook = await db.query.webhooks.findFirst({
    where: eq(webhooks.id, webhookId),
  });

  if (!webhook) {
    return null;
  }

  // Get the original log
  const log = await db.query.webhookLogs.findFirst({
    where: eq(webhookLogs.id, logId),
  });

  if (!log || !log.payload) {
    return null;
  }

  // Retry the webhook
  return sendWebhook(webhook, log.payload as unknown as WebhookPayload);
}

// Test webhook (send a test payload)
export async function testWebhook(webhookId: string): Promise<DeliveryResult | null> {
  const webhook = await db.query.webhooks.findFirst({
    where: eq(webhooks.id, webhookId),
    with: {
      form: true,
    },
  });

  if (!webhook) {
    return null;
  }

  const testPayload: WebhookPayload = {
    event: "response.completed",
    timestamp: new Date().toISOString(),
    data: {
      formId: webhook.formId,
      formTitle: webhook.form.title,
      test: true,
      response: {
        id: "test-response-id",
        answers: [
          {
            questionId: "test-question-1",
            question: "What is your name?",
            value: "Test User",
          },
        ],
      },
    },
  };

  return sendWebhook(webhook, testPayload);
}
