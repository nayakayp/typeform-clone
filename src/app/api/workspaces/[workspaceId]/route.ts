import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, activityLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { WorkspaceRole } from "@/lib/db/schema";

async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string,
  requiredPermission?: Permission
): Promise<{
  workspace: typeof workspaces.$inferSelect | null;
  member: typeof workspaceMembers.$inferSelect | null;
  hasAccess: boolean;
  error?: string;
}> {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!workspace) {
    return { workspace: null, member: null, hasAccess: false, error: "Workspace not found" };
  }

  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member) {
    return { workspace, member: null, hasAccess: false, error: "Not a member of this workspace" };
  }

  if (requiredPermission && !hasPermission(member.role as WorkspaceRole, requiredPermission)) {
    return { workspace, member, hasAccess: false, error: "Insufficient permissions" };
  }

  return { workspace, member, hasAccess: true };
}

// GET /api/workspaces/[workspaceId] - Get workspace details
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

    const { workspace, member, hasAccess, error } = await checkWorkspaceAccess(
      workspaceId,
      session.user.id
    );

    if (!hasAccess) {
      const status = !workspace ? 404 : !member ? 403 : 403;
      return NextResponse.json({ error }, { status });
    }

    // Get workspace with owner info
    const workspaceWithDetails = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...workspaceWithDetails,
      currentMember: member,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/workspaces/[workspaceId] - Update workspace
export async function PATCH(
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

    const { workspace, member, hasAccess, error } = await checkWorkspaceAccess(
      workspaceId,
      session.user.id,
      "settings:edit"
    );

    if (!hasAccess) {
      const status = !workspace ? 404 : 403;
      return NextResponse.json({ error }, { status });
    }

    const body = await request.json();
    const { name, slug, logo, settings, plan } = body;

    // If updating slug, check it's not taken
    if (slug && slug !== workspace!.slug) {
      const existingWorkspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.slug, slug),
      });

      if (existingWorkspace) {
        return NextResponse.json(
          { error: "Workspace slug already exists" },
          { status: 409 }
        );
      }
    }

    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(logo !== undefined && { logo }),
        ...(settings !== undefined && { settings }),
        ...(plan !== undefined && { plan }),
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId,
      userId: session.user.id,
      action: "workspace.updated",
      resourceType: "workspace",
      resourceId: workspaceId,
      metadata: { changes: Object.keys(body) },
    });

    return NextResponse.json({
      ...updatedWorkspace,
      currentMember: member,
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[workspaceId] - Delete workspace
export async function DELETE(
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

    // Only owner can delete workspace
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the workspace owner can delete it" },
        { status: 403 }
      );
    }

    // Delete workspace (cascade will handle members, invitations, etc.)
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
