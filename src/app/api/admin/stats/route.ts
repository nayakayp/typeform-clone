import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin, getAdminStats } from "@/lib/admin";

// GET /api/admin/stats - Get admin dashboard stats
export async function GET() {
  try {
    const admin = await requireAdmin(await headers());
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getAdminStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    return NextResponse.json(
      { error: "Failed to get admin stats" },
      { status: 500 }
    );
  }
}
