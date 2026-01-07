import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, workspaceInvitations, activityLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/invitations/[token]/accept - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await db.query.workspaceInvitations.findFirst({
      where: eq(workspaceInvitations.token, token),
      with: {
        workspace: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        inviter: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      workspace: invitation.workspace,
      invitedBy: invitation.inviter,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[token]/accept - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitation = await db.query.workspaceInvitations.findFirst({
      where: eq(workspaceInvitations.token, token),
      with: {
        workspace: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
    }

    // Check if user email matches invitation email
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation is for a different email address" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, session.user.id),
    });

    if (existingMember && existingMember.workspaceId === invitation.workspaceId) {
      // Already a member, just delete invitation
      await db.delete(workspaceInvitations).where(eq(workspaceInvitations.id, invitation.id));
      return NextResponse.json({
        success: true,
        message: "You are already a member of this workspace",
        workspaceId: invitation.workspaceId,
      });
    }

    // Add user as member
    await db.insert(workspaceMembers).values({
      workspaceId: invitation.workspaceId,
      userId: session.user.id,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
    });

    // Delete invitation
    await db.delete(workspaceInvitations).where(eq(workspaceInvitations.id, invitation.id));

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId: invitation.workspaceId,
      userId: session.user.id,
      action: "member.joined",
      resourceType: "member",
      resourceId: session.user.id,
      metadata: {
        email: session.user.email,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
      },
    });

    return NextResponse.json({
      success: true,
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspace.name,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
