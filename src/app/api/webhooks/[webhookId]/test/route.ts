import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { webhooks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { testWebhook } from "@/lib/webhooks";

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

// POST /api/webhooks/[webhookId]/test - Send test webhook
export async function POST(
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

    const result = await testWebhook(webhookId);

    if (!result) {
      return NextResponse.json({ error: "Failed to test webhook" }, { status: 500 });
    }

    return NextResponse.json({
      success: result.success,
      status: result.status,
      error: result.error,
    });
  } catch (error) {
    console.error("Failed to test webhook:", error);
    return NextResponse.json(
      { error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
