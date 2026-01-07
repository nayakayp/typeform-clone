import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { webhooks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWebhookLogs } from "@/lib/webhooks";

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

// GET /api/webhooks/[webhookId]/logs - Get webhook delivery logs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookId } = await params;
    const webhook = await verifyWebhookOwnership(webhookId, session.user.id);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const logs = await getWebhookLogs(webhookId, { limit, offset });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to fetch webhook logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhook logs" },
      { status: 500 }
    );
  }
}
