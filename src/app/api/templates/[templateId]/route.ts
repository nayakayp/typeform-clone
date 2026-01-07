import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { TEMPLATE_CATEGORIES } from "@/lib/db/schema";
import {
  getTemplate,
  updateTemplate,
  deleteTemplate,
  createFormFromTemplate,
} from "@/lib/versions";

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/templates/[templateId] - Get template details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;
    const template = await getTemplate(templateId);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Check if user can access this template
    if (!template.isPublic && template.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Failed to get template:", error);
    return NextResponse.json(
      { error: "Failed to get template" },
      { status: 500 }
    );
  }
}

// PATCH /api/templates/[templateId] - Update template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;
    const template = await getTemplate(templateId);

    if (!template || template.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await updateTemplate(templateId, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[templateId] - Delete template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;
    const template = await getTemplate(templateId);

    if (!template || template.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await deleteTemplate(templateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

// POST /api/templates/[templateId] - Create form from template
export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;
    const template = await getTemplate(templateId);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Check if user can access this template
    if (!template.isPublic && template.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Verify workspace ownership
    const workspace = await db.query.workspaces.findFirst({
      where: eq(formTemplates.id, workspaceId),
    });

    if (!workspace || workspace.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const result = await createFormFromTemplate(
      templateId,
      workspaceId,
      session.user.id
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create form from template:", error);
    return NextResponse.json(
      { error: "Failed to create form from template" },
      { status: 500 }
    );
  }
}
