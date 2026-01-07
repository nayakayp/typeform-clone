import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, activityLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/workspaces/[workspaceId]/transfer - Transfer ownership
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owner can transfer
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the workspace owner can transfer ownership" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json(
        { error: "New owner ID is required" },
        { status: 400 }
      );
    }

    // Check if new owner is a member
    const newOwnerMember = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, newOwnerId)
      ),
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

    if (!newOwnerMember) {
      return NextResponse.json(
        { error: "New owner must be a member of the workspace" },
        { status: 400 }
      );
    }

    // Get current owner member record
    const currentOwnerMember = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    // Update workspace owner
    await db
      .update(workspaces)
      .set({
        ownerId: newOwnerId,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));

    // Update member roles
    await db
      .update(workspaceMembers)
      .set({ role: "owner" })
      .where(eq(workspaceMembers.id, newOwnerMember.id));

    if (currentOwnerMember) {
      await db
        .update(workspaceMembers)
        .set({ role: "admin" })
        .where(eq(workspaceMembers.id, currentOwnerMember.id));
    }

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: "workspace.ownership_transferred",
      resourceType: "workspace",
      resourceId: workspaceId,
      metadata: {
        newOwnerEmail: newOwnerMember.user.email,
        newOwnerId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
