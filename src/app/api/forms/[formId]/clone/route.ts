import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { cloneForm } from "@/lib/versions";

const cloneSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  newTitle: z.string().optional(),
  includeTheme: z.boolean().optional(),
  includeLogic: z.boolean().optional(),
  includeIntegrations: z.boolean().optional(),
});

// POST /api/forms/[formId]/clone - Clone a form
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
    const validation = cloneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const targetWorkspaceId = validation.data.workspaceId || form.workspaceId;

    // If cloning to a different workspace, verify ownership
    if (targetWorkspaceId !== form.workspaceId) {
      const targetWorkspace = await db.query.workspaces.findFirst({
        where: eq(forms.id, targetWorkspaceId),
      });

      if (!targetWorkspace || targetWorkspace.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: "Target workspace not found" },
          { status: 404 }
        );
      }
    }

    const result = await cloneForm(formId, targetWorkspaceId, session.user.id, {
      newTitle: validation.data.newTitle,
      includeTheme: validation.data.includeTheme,
      includeLogic: validation.data.includeLogic,
      includeIntegrations: validation.data.includeIntegrations,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to clone form:", error);
    return NextResponse.json(
      { error: "Failed to clone form" },
      { status: 500 }
    );
  }
}
