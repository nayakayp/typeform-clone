import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaceMembers, activityLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission, canManageRole } from "@/lib/permissions";
import type { WorkspaceRole } from "@/lib/db/schema";

// PATCH /api/workspaces/[workspaceId]/members/[memberId] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check current user's membership
    const currentMember = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    if (!hasPermission(currentMember.role as WorkspaceRole, "team:manage-roles")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get target member
    const targetMember = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.id, memberId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Cannot change owner's role
    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change the workspace owner's role" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body as { role: WorkspaceRole };

    if (!role || !["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if current user can manage to this role
    if (!canManageRole(currentMember.role as WorkspaceRole, role)) {
      return NextResponse.json(
        { error: "Cannot assign this role" },
        { status: 403 }
      );
    }

    const [updatedMember] = await db
      .update(workspaceMembers)
      .set({ role })
      .where(eq(workspaceMembers.id, memberId))
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: "member.role_changed",
      resourceType: "member",
      resourceId: targetMember.userId,
      metadata: {
        memberEmail: targetMember.user.email,
        oldRole: targetMember.role,
        newRole: role,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[workspaceId]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check current user's membership
    const currentMember = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    // Get target member
    const targetMember = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.id, memberId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Cannot remove owner
    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the workspace owner" },
        { status: 400 }
      );
    }

    // User can remove themselves, or need team:remove permission
    const isSelfRemoval = targetMember.userId === session.user.id;
    if (!isSelfRemoval && !hasPermission(currentMember.role as WorkspaceRole, "team:remove")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check role hierarchy for non-self removal
    if (!isSelfRemoval && !canManageRole(currentMember.role as WorkspaceRole, targetMember.role as WorkspaceRole)) {
      return NextResponse.json(
        { error: "Cannot remove a member with higher or equal role" },
        { status: 403 }
      );
    }

    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId));

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: isSelfRemoval ? "member.left" : "member.removed",
      resourceType: "member",
      resourceId: targetMember.userId,
      metadata: {
        memberEmail: targetMember.user.email,
        role: targetMember.role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
