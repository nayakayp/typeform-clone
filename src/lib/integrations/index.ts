import { db } from "@/lib/db";
import {
  integrations,
  formIntegrations,
  integrationLogs,
  integrationTokens,
  zapierSubscriptions,
  IntegrationProvider,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Get workspace integrations
export async function getWorkspaceIntegrations(workspaceId: string) {
  return await db.query.integrations.findMany({
    where: eq(integrations.workspaceId, workspaceId),
    orderBy: [desc(integrations.createdAt)],
  });
}

// Get form integrations
export async function getFormIntegrations(formId: string) {
  return await db.query.formIntegrations.findMany({
    where: eq(formIntegrations.formId, formId),
    with: {
      integration: true,
    },
    orderBy: [desc(formIntegrations.createdAt)],
  });
}

// Create workspace integration
export async function createWorkspaceIntegration(
  workspaceId: string,
  provider: IntegrationProvider,
  config: Record<string, unknown>
) {
  const [integration] = await db.insert(integrations).values({
    workspaceId,
    provider,
    config,
    isActive: true,
  }).returning();

  return integration;
}

// Connect form to integration
export async function connectFormIntegration(
  formId: string,
  integrationId: string,
  config: Record<string, unknown>
) {
  const [formIntegration] = await db.insert(formIntegrations).values({
    formId,
    integrationId,
    config,
    isActive: true,
  }).returning();

  return formIntegration;
}

// Update form integration
export async function updateFormIntegration(
  formIntegrationId: string,
  updates: Partial<{
    config: Record<string, unknown>;
    isActive: boolean;
  }>
) {
  await db.update(formIntegrations)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(formIntegrations.id, formIntegrationId));
}

// Delete form integration
export async function deleteFormIntegration(formIntegrationId: string) {
  await db.delete(formIntegrations)
    .where(eq(formIntegrations.id, formIntegrationId));
}

// Log integration activity
export async function logIntegrationActivity(
  formIntegrationId: string,
  action: string,
  status: "success" | "error",
  message?: string,
  details?: Record<string, unknown>
) {
  await db.insert(integrationLogs).values({
    formIntegrationId,
    action,
    status,
    message,
    details,
  });

  // Update last sync info
  if (action === "sync") {
    await db.update(formIntegrations)
      .set({
        lastSyncAt: new Date(),
        lastError: status === "error" ? message : null,
        updatedAt: new Date(),
      })
      .where(eq(formIntegrations.id, formIntegrationId));
  }
}

// Get integration logs
export async function getIntegrationLogs(
  formIntegrationId: string,
  limit = 50
) {
  return await db.query.integrationLogs.findMany({
    where: eq(integrationLogs.formIntegrationId, formIntegrationId),
    orderBy: [desc(integrationLogs.createdAt)],
    limit,
  });
}

// Save integration tokens
export async function saveIntegrationTokens(
  integrationId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    scope?: string;
    expiresAt?: Date;
  }
) {
  // Delete existing tokens
  await db.delete(integrationTokens)
    .where(eq(integrationTokens.integrationId, integrationId));

  // Insert new tokens
  await db.insert(integrationTokens).values({
    integrationId,
    ...tokens,
  });
}

// Get integration tokens
export async function getIntegrationTokens(integrationId: string) {
  return await db.query.integrationTokens.findFirst({
    where: eq(integrationTokens.integrationId, integrationId),
  });
}

// Zapier subscriptions
export async function createZapierSubscription(
  formId: string,
  hookUrl: string,
  event: string
) {
  const [subscription] = await db.insert(zapierSubscriptions).values({
    formId,
    hookUrl,
    event,
    isActive: true,
  }).returning();

  return subscription;
}

export async function deleteZapierSubscription(subscriptionId: string) {
  await db.delete(zapierSubscriptions)
    .where(eq(zapierSubscriptions.id, subscriptionId));
}

export async function getZapierSubscriptions(formId: string) {
  return await db.query.zapierSubscriptions.findMany({
    where: eq(zapierSubscriptions.formId, formId),
  });
}

// Trigger Zapier webhooks
export async function triggerZapierWebhooks(
  formId: string,
  event: string,
  data: Record<string, unknown>
) {
  const subscriptions = await db.query.zapierSubscriptions.findMany({
    where: and(
      eq(zapierSubscriptions.formId, formId),
      eq(zapierSubscriptions.event, event),
      eq(zapierSubscriptions.isActive, true)
    ),
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const response = await fetch(sub.hookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Zapier webhook failed: ${response.status}`);
      }

      return { subscriptionId: sub.id, success: true };
    })
  );

  return results;
}
