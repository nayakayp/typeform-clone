import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, formVersions, FormSnapshot } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getVersion, compareVersions, updateVersionLabel } from "@/lib/versions";

// GET /api/forms/[formId]/versions/[versionId] - Get version details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string; versionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, versionId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const version = await getVersion(versionId);

    if (!version || version.formId !== formId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Get previous version for diff comparison
    const previousVersion = await db.query.formVersions.findFirst({
      where: eq(formVersions.formId, formId),
      orderBy: (v, { desc }) => [desc(v.version)],
      offset: 1,
    });

    let diff = null;
    if (previousVersion) {
      diff = compareVersions(previousVersion.snapshot as FormSnapshot, version.snapshot as FormSnapshot);
    }

    return NextResponse.json({ version, diff });
  } catch (error) {
    console.error("Failed to get version:", error);
    return NextResponse.json(
      { error: "Failed to get version" },
      { status: 500 }
    );
  }
}

// PATCH /api/forms/[formId]/versions/[versionId] - Update version label
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string; versionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, versionId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const version = await getVersion(versionId);

    if (!version || version.formId !== formId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const body = await request.json();
    const { label } = body;

    await updateVersionLabel(versionId, label || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update version:", error);
    return NextResponse.json(
      { error: "Failed to update version" },
      { status: 500 }
    );
  }
}
