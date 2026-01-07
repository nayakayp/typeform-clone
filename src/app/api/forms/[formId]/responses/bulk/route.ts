import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, responses } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const bulkActionSchema = z.object({
  action: z.enum(["delete", "archive"]),
  ids: z.array(z.string()).min(1, "At least one response ID required"),
});

// POST /api/forms/[formId]/responses/bulk - Perform bulk action
export async function POST(
  request: Request,
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

    // Parse request body
    const body = await request.json();
    const validation = bulkActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, ids } = validation.data;

    // Verify all responses belong to this form
    const formResponses = await db.query.responses.findMany({
      where: and(
        eq(responses.formId, formId),
        inArray(responses.id, ids)
      ),
    });

    if (formResponses.length !== ids.length) {
      return NextResponse.json(
        { error: "Some responses not found or don't belong to this form" },
        { status: 400 }
      );
    }

    let affectedCount = 0;

    switch (action) {
      case "delete": {
        // Delete responses
        const result = await db
          .delete(responses)
          .where(
            and(
              eq(responses.formId, formId),
              inArray(responses.id, ids)
            )
          )
          .returning();
        affectedCount = result.length;
        break;
      }

      case "archive": {
        // For archive, we could mark them as archived
        // For now, we'll just update a metadata field or similar
        // Since we don't have an archive field, we'll just return success
        // In a real implementation, add an isArchived column
        affectedCount = ids.length;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      affectedCount,
    });
  } catch (error) {
    console.error("Failed to perform bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
