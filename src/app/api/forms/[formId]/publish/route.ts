import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/forms/[formId]/publish - Publish a form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Get form with workspace to verify ownership
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Verify user owns the workspace
    if (form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if already published
    if (form.status === "published") {
      return NextResponse.json(
        { error: "Form is already published" },
        { status: 400 }
      );
    }

    // Check if form has at least one question
    const formQuestions = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
      limit: 1,
    });

    if (formQuestions.length === 0) {
      return NextResponse.json(
        { error: "Cannot publish a form without questions" },
        { status: 400 }
      );
    }

    // Publish the form
    const [updated] = await db
      .update(forms)
      .set({
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(forms.id, formId))
      .returning();

    return NextResponse.json({
      success: true,
      form: updated,
      message: "Form published successfully",
    });
  } catch (error) {
    console.error("Error publishing form:", error);
    return NextResponse.json(
      { error: "Failed to publish form" },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[formId]/publish - Unpublish a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Get form with workspace to verify ownership
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Verify user owns the workspace
    if (form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Unpublish the form (set to draft)
    const [updated] = await db
      .update(forms)
      .set({
        status: "draft",
        updatedAt: new Date(),
      })
      .where(eq(forms.id, formId))
      .returning();

    return NextResponse.json({
      success: true,
      form: updated,
      message: "Form unpublished successfully",
    });
  } catch (error) {
    console.error("Error unpublishing form:", error);
    return NextResponse.json(
      { error: "Failed to unpublish form" },
      { status: 500 }
    );
  }
}
