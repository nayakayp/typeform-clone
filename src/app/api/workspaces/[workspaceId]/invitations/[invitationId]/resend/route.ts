import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaceMembers, workspaceInvitations, activityLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission } from "@/lib/permissions";
import type { WorkspaceRole } from "@/lib/db/schema";
import crypto from "crypto";

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// POST /api/workspaces/[workspaceId]/invitations/[invitationId]/resend - Resend invitation
export async function POST(
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

    // Generate new token and extend expiration
    const newToken = generateInviteToken();
    const newExpiresAt = addDays(new Date(), 7);

    const [updatedInvitation] = await db
      .update(workspaceInvitations)
      .set({
        token: newToken,
        expiresAt: newExpiresAt,
        invitedBy: session.user.id,
      })
      .where(eq(workspaceInvitations.id, invitationId))
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: "invitation.resent",
      resourceType: "invitation",
      resourceId: invitationId,
      metadata: { email: invitation.email },
    });

    // TODO: Send invitation email
    // await sendInvitationEmail(invitation.email, updatedInvitation, workspace);

    return NextResponse.json(updatedInvitation);
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
