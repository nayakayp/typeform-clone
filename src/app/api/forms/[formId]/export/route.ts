import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { exportFormAsJson } from "@/lib/versions";

// GET /api/forms/[formId]/export - Export form as JSON
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

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const exportData = await exportFormAsJson(formId);

    // Return as downloadable JSON file
    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${form.title.replace(/[^a-z0-9]/gi, "_")}.json"`
    );
    headers.set("Content-Type", "application/json");

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Failed to export form:", error);
    return NextResponse.json(
      { error: "Failed to export form" },
      { status: 500 }
    );
  }
}
