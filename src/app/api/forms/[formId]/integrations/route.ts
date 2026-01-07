import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, formIntegrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getFormIntegrations, connectFormIntegration, deleteFormIntegration, updateFormIntegration } from "@/lib/integrations";

const createIntegrationSchema = z.object({
  integrationId: z.string().uuid(),
  config: z.record(z.unknown()).optional(),
});

// GET /api/forms/[formId]/integrations - List form integrations
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

    // Verify form access
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: { workspace: true },
    });

    if (!form || form.workspace?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const integrations = await getFormIntegrations(formId);

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Failed to get form integrations:", error);
    return NextResponse.json(
      { error: "Failed to get integrations" },
      { status: 500 }
    );
  }
}

// POST /api/forms/[formId]/integrations - Connect integration to form
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

    // Verify form access
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: { workspace: true },
    });

    if (!form || form.workspace?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = createIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const formIntegration = await connectFormIntegration(
      formId,
      validation.data.integrationId,
      validation.data.config || {}
    );

    return NextResponse.json({ integration: formIntegration }, { status: 201 });
  } catch (error) {
    console.error("Failed to connect integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 }
    );
  }
}
