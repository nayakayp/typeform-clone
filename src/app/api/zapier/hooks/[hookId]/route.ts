import { NextResponse } from "next/server";
import { deleteZapierSubscription } from "@/lib/integrations";

// DELETE /api/zapier/hooks/[hookId] - Unsubscribe from webhook
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ hookId: string }> }
) {
  try {
    const { hookId } = await params;

    await deleteZapierSubscription(hookId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Zapier unsubscribe failed:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
