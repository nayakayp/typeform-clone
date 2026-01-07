import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  getFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
} from "@/lib/admin/feature-flags";

const updateFlagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetUsers: z.array(z.string()).optional(),
  targetWorkspaces: z.array(z.string()).optional(),
});

// GET /api/admin/feature-flags/[flagId] - Get feature flag
export async function GET(
  request: Request,
  { params }: { params: Promise<{ flagId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { flagId } = await params;
    const flag = await getFeatureFlag(flagId);

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({ flag });
  } catch (error) {
    console.error("Failed to get feature flag:", error);
    return NextResponse.json(
      { error: "Failed to get feature flag" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/feature-flags/[flagId] - Update feature flag
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ flagId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { flagId } = await params;
    const flag = await getFeatureFlag(flagId);

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateFlagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // If only enabled is being changed, use toggle
    if (
      Object.keys(validation.data).length === 1 &&
      validation.data.enabled !== undefined
    ) {
      await toggleFeatureFlag(admin.userId, flagId, validation.data.enabled);
    } else {
      await updateFeatureFlag(admin.userId, flagId, validation.data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update feature flag:", error);
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/feature-flags/[flagId] - Delete feature flag
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ flagId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin || !admin.isSuper) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { flagId } = await params;
    const flag = await getFeatureFlag(flagId);

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    await deleteFeatureFlag(admin.userId, flagId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete feature flag:", error);
    return NextResponse.json(
      { error: "Failed to delete feature flag" },
      { status: 500 }
    );
  }
}
