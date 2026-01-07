import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getFormAnalyticsOverview,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getCountryBreakdown,
  getSourceBreakdown,
  getDropOffAnalysis,
} from "@/lib/analytics";

// GET /api/forms/[formId]/analytics - Get form analytics overview
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

    // Parse date range from query params
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Default to last 30 days
    const to = toParam ? new Date(toParam) : new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dateRange = { from, to };

    // Fetch all analytics data in parallel
    const [overview, devices, browsers, countries, sources, dropOff] =
      await Promise.all([
        getFormAnalyticsOverview(formId, dateRange),
        getDeviceBreakdown(formId, dateRange),
        getBrowserBreakdown(formId, dateRange),
        getCountryBreakdown(formId, dateRange),
        getSourceBreakdown(formId, dateRange),
        getDropOffAnalysis(formId, dateRange),
      ]);

    return NextResponse.json({
      formId,
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      overview,
      devices,
      browsers,
      countries,
      sources,
      dropOff,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
