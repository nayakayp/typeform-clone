import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, responses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/forms/[formId]/responses/[responseId] - Get a specific response
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string; responseId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, responseId } = await params;

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

    // Fetch the specific response
    const response = await db.query.responses.findFirst({
      where: and(
        eq(responses.id, responseId),
        eq(responses.formId, formId)
      ),
      with: {
        answers: {
          with: {
            question: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Failed to fetch response:", error);
    return NextResponse.json(
      { error: "Failed to fetch response" },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[formId]/responses/[responseId] - Delete a response
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ formId: string; responseId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, responseId } = await params;

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

    // Delete the response (answers will be cascade deleted)
    const deleted = await db
      .delete(responses)
      .where(
        and(
          eq(responses.id, responseId),
          eq(responses.formId, formId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete response:", error);
    return NextResponse.json(
      { error: "Failed to delete response" },
      { status: 500 }
    );
  }
}
