import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  getFeatureFlags,
  createFeatureFlag,
} from "@/lib/admin/feature-flags";

const createFlagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

// GET /api/admin/feature-flags - List feature flags
export async function GET() {
  try {
    const admin = await requireAdmin(await headers());
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flags = await getFeatureFlags();

    return NextResponse.json({ flags });
  } catch (error) {
    console.error("Failed to get feature flags:", error);
    return NextResponse.json(
      { error: "Failed to get feature flags" },
      { status: 500 }
    );
  }
}

// POST /api/admin/feature-flags - Create feature flag
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(await headers());
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createFlagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const flag = await createFeatureFlag(admin.userId, validation.data);

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error) {
    console.error("Failed to create feature flag:", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
