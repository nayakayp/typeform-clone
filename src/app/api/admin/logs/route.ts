import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminLogs } from "@/lib/db/schema/admin";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/logs - List admin activity logs
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const logs = await db
      .select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        action: adminLogs.action,
        targetType: adminLogs.targetType,
        targetId: adminLogs.targetId,
        metadata: adminLogs.metadata,
        createdAt: adminLogs.createdAt,
        admin: {
          name: users.name,
          email: users.email,
        },
      })
      .from(adminLogs)
      .leftJoin(users, eq(adminLogs.adminId, users.id))
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to get admin logs:", error);
    return NextResponse.json(
      { error: "Failed to get admin logs" },
      { status: 500 }
    );
  }
}
