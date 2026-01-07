import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { webhooks, forms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
});

// GET /api/forms/[formId]/webhooks - List webhooks for a form
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Verify user owns the form
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const formWebhooks = await db.query.webhooks.findMany({
      where: eq(webhooks.formId, formId),
    });

    return NextResponse.json({ webhooks: formWebhooks });
  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

// POST /api/forms/[formId]/webhooks - Create a new webhook
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Verify user owns the form
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = createWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, url, events, secret } = validation.data;

    // Generate a secret if not provided
    const webhookSecret = secret || randomBytes(32).toString("hex");

    const [webhook] = await db
      .insert(webhooks)
      .values({
        formId,
        name,
        url,
        events,
        secret: webhookSecret,
        isActive: true,
      })
      .returning();

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error("Failed to create webhook:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
