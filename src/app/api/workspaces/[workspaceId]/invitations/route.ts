import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, workspaceMembers, workspaceInvitations, activityLogs } from "@/lib/db/schema";
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

// GET /api/workspaces/[workspaceId]/invitations - List pending invitations
export async function GET(
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

    if (!hasPermission(currentMember.role as WorkspaceRole, "team:view")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const invitations = await db.query.workspaceInvitations.findMany({
      where: eq(workspaceInvitations.workspaceId, workspaceId),
      with: {
        inviter: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (invitations, { desc }) => [desc(invitations.createdAt)],
    });

    // Filter out expired invitations in the response
    const now = new Date();
    const activeInvitations = invitations.map((inv) => ({
      ...inv,
      status: inv.expiresAt < now ? "expired" : "pending",
    }));

    return NextResponse.json(activeInvitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/[workspaceId]/invitations - Create invitation
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

    const body = await request.json();
    const { email, role = "member" } = body as { email: string; role?: WorkspaceRole };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if email is already a member
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      const isMember = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, existingUser.id)
        ),
      });

      if (isMember) {
        return NextResponse.json(
          { error: "User is already a member of this workspace" },
          { status: 409 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await db.query.workspaceInvitations.findFirst({
      where: and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.email, email)
      ),
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation for this email already exists" },
        { status: 409 }
      );
    }

    // Create invitation
    const token = generateInviteToken();
    const expiresAt = addDays(new Date(), 7);

    const [invitation] = await db
      .insert(workspaceInvitations)
      .values({
        workspaceId,
        email,
        role,
        token,
        invitedBy: session.user.id,
        expiresAt,
      })
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: "invitation.sent",
      resourceType: "invitation",
      resourceId: invitation.id,
      metadata: { email, role },
    });

    // TODO: Send invitation email using Nodemailer or Resend
    // await sendInvitationEmail(email, invitation, workspace);

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
