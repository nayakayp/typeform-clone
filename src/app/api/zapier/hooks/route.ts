import { NextResponse } from "next/server";
import { z } from "zod";
import { createZapierSubscription, deleteZapierSubscription } from "@/lib/integrations";

const subscribeSchema = z.object({
  hookUrl: z.string().url(),
  formId: z.string().uuid(),
  event: z.string(),
});

// POST /api/zapier/hooks - Subscribe to webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const subscription = await createZapierSubscription(
      validation.data.formId,
      validation.data.hookUrl,
      validation.data.event
    );

    return NextResponse.json({ id: subscription.id }, { status: 201 });
  } catch (error) {
    console.error("Zapier subscription failed:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
