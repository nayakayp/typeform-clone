import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { webhooks, forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  secret: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Helper to verify webhook ownership
async function verifyWebhookOwnership(webhookId: string, userId: string) {
  const webhook = await db.query.webhooks.findFirst({
    where: eq(webhooks.id, webhookId),
    with: {
      form: {
        with: {
          workspace: true,
        },
      },
    },
  });

  if (!webhook || webhook.form.workspace.ownerId !== userId) {
    return null;
  }

  return webhook;
}

// GET /api/webhooks/[webhookId] - Get webhook details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookId } = await params;
    const webhook = await verifyWebhookOwnership(webhookId, session.user.id);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("Failed to fetch webhook:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhook" },
      { status: 500 }
    );
  }
}

// PATCH /api/webhooks/[webhookId] - Update webhook
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookId } = await params;
    const webhook = await verifyWebhookOwnership(webhookId, session.user.id);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (validation.data.name) updateData.name = validation.data.name;
    if (validation.data.url) updateData.url = validation.data.url;
    if (validation.data.events) updateData.events = validation.data.events;
    if (validation.data.secret) updateData.secret = validation.data.secret;
    if (typeof validation.data.isActive === "boolean") {
      updateData.isActive = validation.data.isActive;
    }

    const [updated] = await db
      .update(webhooks)
      .set(updateData)
      .where(eq(webhooks.id, webhookId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update webhook:", error);
    return NextResponse.json(
      { error: "Failed to update webhook" },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks/[webhookId] - Delete webhook
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookId } = await params;
    const webhook = await verifyWebhookOwnership(webhookId, session.user.id);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    await db.delete(webhooks).where(eq(webhooks.id, webhookId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete webhook:", error);
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
