import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, activityLogs } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/workspaces - List all workspaces for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get workspaces where user is owner or member
    const userWorkspaces = await db.query.workspaces.findMany({
      where: or(
        eq(workspaces.ownerId, userId)
      ),
      with: {
        members: {
          where: eq(workspaceMembers.userId, userId),
        },
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: (workspaces, { desc }) => [desc(workspaces.createdAt)],
    });

    // Also get workspaces where user is a member but not owner
    const memberWorkspaces = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, userId),
      with: {
        workspace: {
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
        },
      },
    });

    // Combine and dedupe workspaces
    const allWorkspaces = new Map();

    for (const ws of userWorkspaces) {
      const member = ws.members[0];
      allWorkspaces.set(ws.id, {
        ...ws,
        currentMember: member || {
          id: ws.id,
          workspaceId: ws.id,
          userId,
          role: "owner" as const,
          invitedBy: null,
          joinedAt: ws.createdAt,
        },
      });
    }

    for (const membership of memberWorkspaces) {
      if (!allWorkspaces.has(membership.workspace.id)) {
        allWorkspaces.set(membership.workspace.id, {
          ...membership.workspace,
          currentMember: membership,
        });
      }
    }

    return NextResponse.json(Array.from(allWorkspaces.values()));
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingWorkspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.slug, slug),
    });

    if (existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace slug already exists" },
        { status: 409 }
      );
    }

    // Create workspace
    const [newWorkspace] = await db
      .insert(workspaces)
      .values({
        name,
        slug,
        ownerId: userId,
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
        },
      })
      .returning();

    // Add owner as a member with owner role
    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userId,
      role: "owner",
    });

    // Log activity
    await db.insert(activityLogs).values({
      workspaceId: newWorkspace.id,
      userId,
      action: "workspace.created",
      resourceType: "workspace",
      resourceId: newWorkspace.id,
      metadata: { name, slug },
    });

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
