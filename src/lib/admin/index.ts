import { db } from "@/lib/db";
import { users, adminLogs, AdminAction } from "@/lib/db/schema";
import { eq, sql, desc, and, gte, lte, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

// Check if user is an admin
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user?.role === "admin" || user?.role === "super_admin";
}

// Check if user is a super admin
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user?.role === "super_admin";
}

// Admin authentication check
export async function requireAdmin(): Promise<{ userId: string; isSuper: boolean } | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  return {
    userId: session.user.id,
    isSuper: user.role === "super_admin",
  };
}

// Log admin action
export async function logAdminAction(
  adminId: string,
  action: AdminAction,
  options?: {
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }
): Promise<void> {
  await db.insert(adminLogs).values({
    adminId,
    action,
    targetType: options?.targetType,
    targetId: options?.targetId,
    metadata: options?.metadata,
    ipAddress: options?.ipAddress,
  });
}

// Get admin logs
export async function getAdminLogs(options?: {
  adminId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    adminId,
    action,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = options || {};

  const conditions: Parameters<typeof and>[0][] = [];

  if (adminId) {
    conditions.push(eq(adminLogs.adminId, adminId));
  }

  if (action) {
    conditions.push(eq(adminLogs.action, action));
  }

  if (startDate) {
    conditions.push(gte(adminLogs.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(adminLogs.createdAt, endDate));
  }

  return await db.query.adminLogs.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      admin: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(adminLogs.createdAt)],
    limit,
    offset,
  });
}

// Get admin stats
export async function getAdminStats() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get total counts
  const [totalUsersResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  const [totalFormsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sql`forms`);

  const [totalResponsesResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sql`responses`);

  // Get new signups this week
  const [newUsersWeekResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(gte(users.createdAt, lastWeek));

  // Get active users in last 24h (users who have submitted responses)
  const [activeUsers24hResult] = await db
    .select({ count: sql<number>`count(DISTINCT submitted_by)::int` })
    .from(sql`responses`)
    .where(sql`created_at >= ${yesterday}`);

  return {
    totalUsers: totalUsersResult?.count || 0,
    totalForms: totalFormsResult?.count || 0,
    totalResponses: totalResponsesResult?.count || 0,
    newUsersThisWeek: newUsersWeekResult?.count || 0,
    activeUsers24h: activeUsers24hResult?.count || 0,
  };
}

// Get users for admin management
export async function getAdminUsers(options?: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const {
    search,
    role,
    status,
    limit = 50,
    offset = 0,
  } = options || {};

  const conditions: Parameters<typeof and>[0][] = [];

  if (search) {
    conditions.push(
      or(
        ilike(users.email, `%${search}%`),
        ilike(users.name, `%${search}%`)
      )
    );
  }

  if (role) {
    conditions.push(eq(users.role, role));
  }

  if (status) {
    conditions.push(eq(users.status, status));
  }

  const userList = await db.query.users.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: [desc(users.createdAt)],
    limit,
    offset,
  });

  // Get form counts for each user
  const usersWithStats = await Promise.all(
    userList.map(async (user) => {
      const [formCountResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sql`workspaces`)
        .where(sql`owner_id = ${user.id}`);

      return {
        ...user,
        formCount: formCountResult?.count || 0,
      };
    })
  );

  return usersWithStats;
}

// Suspend a user
export async function suspendUser(
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> {
  await db.update(users)
    .set({ status: "suspended" })
    .where(eq(users.id, userId));

  await logAdminAction(adminId, "user.suspend", {
    targetType: "user",
    targetId: userId,
    metadata: { reason },
  });
}

// Unsuspend a user
export async function unsuspendUser(
  adminId: string,
  userId: string
): Promise<void> {
  await db.update(users)
    .set({ status: "active" })
    .where(eq(users.id, userId));

  await logAdminAction(adminId, "user.unsuspend", {
    targetType: "user",
    targetId: userId,
  });
}

// Update user role
export async function updateUserRole(
  adminId: string,
  userId: string,
  role: "user" | "admin"
): Promise<void> {
  await db.update(users)
    .set({ role })
    .where(eq(users.id, userId));

  await logAdminAction(adminId, "user.update", {
    targetType: "user",
    targetId: userId,
    metadata: { role },
  });
}
