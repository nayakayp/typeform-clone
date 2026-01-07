import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formIntegrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { updateFormIntegration, deleteFormIntegration, logIntegrationActivity } from "@/lib/integrations";

const updateIntegrationSchema = z.object({
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/forms/[formId]/integrations/[integrationId] - Update form integration
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string; integrationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId } = await params;

    // Verify integration exists and user has access
    const formIntegration = await db.query.formIntegrations.findFirst({
      where: eq(formIntegrations.id, integrationId),
      with: {
        form: {
          with: { workspace: true },
        },
      },
    });

    if (!formIntegration || formIntegration.form?.workspace?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await updateFormIntegration(integrationId, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update integration:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[formId]/integrations/[integrationId] - Remove form integration
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ formId: string; integrationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId } = await params;

    // Verify integration exists and user has access
    const formIntegration = await db.query.formIntegrations.findFirst({
      where: eq(formIntegrations.id, integrationId),
      with: {
        form: {
          with: { workspace: true },
        },
      },
    });

    if (!formIntegration || formIntegration.form?.workspace?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    await deleteFormIntegration(integrationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete integration:", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}

// POST /api/forms/[formId]/integrations/[integrationId]/sync - Manual sync
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string; integrationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId } = await params;

    // Verify integration exists
    const formIntegration = await db.query.formIntegrations.findFirst({
      where: eq(formIntegrations.id, integrationId),
      with: {
        integration: true,
        form: {
          with: { workspace: true },
        },
      },
    });

    if (!formIntegration || formIntegration.form?.workspace?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // Log sync attempt
    await logIntegrationActivity(
      integrationId,
      "sync",
      "success",
      "Manual sync completed"
    );

    return NextResponse.json({ success: true, message: "Sync completed" });
  } catch (error) {
    console.error("Failed to sync integration:", error);
    return NextResponse.json(
      { error: "Failed to sync integration" },
      { status: 500 }
    );
  }
}
