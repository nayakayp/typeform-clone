import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaceMembers, workspaceInvitations, activityLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission } from "@/lib/permissions";
import type { WorkspaceRole } from "@/lib/db/schema";
import crypto from "crypto";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// DELETE /api/workspaces/[workspaceId]/invitations/[invitationId] - Cancel invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; invitationId: string }> }
) {
  try {
    const { workspaceId, invitationId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member with permission
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

    if (!hasPermission(currentMember.role as WorkspaceRole, "team:invite")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get invitation
    const invitation = await db.query.workspaceInvitations.findFirst({
      where: eq(workspaceInvitations.id, invitationId),
    });

    if (!invitation || invitation.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    await db.delete(workspaceInvitations).where(eq(workspaceInvitations.id, invitationId));

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: "invitation.cancelled",
      resourceType: "invitation",
      resourceId: invitationId,
      metadata: { email: invitation.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
