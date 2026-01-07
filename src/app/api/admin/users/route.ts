import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin, getAdminUsers } from "@/lib/admin";

type UserRole = "user" | "admin" | "super_admin";
type UserStatus = "active" | "suspended";

const validRoles: UserRole[] = ["user", "admin", "super_admin"];
const validStatuses: UserStatus[] = ["active", "suspended"];

// GET /api/admin/users - List users for admin
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(await headers());
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Validate role and status params
    const role = roleParam && validRoles.includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : undefined;
    const status = statusParam && validStatuses.includes(statusParam as UserStatus)
      ? (statusParam as UserStatus)
      : undefined;

    const users = await getAdminUsers({
      search,
      role,
      status,
      limit,
      offset,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to get users:", error);
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    );
  }
}
