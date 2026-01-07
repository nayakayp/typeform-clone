import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { revokeApiKey, getApiKey } from "@/lib/api/keys";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Helper to get user's workspace
async function getUserWorkspace(userId: string) {
  const membership = await db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.userId, userId),
    with: { workspace: true },
  });

  if (membership) {
    return membership.workspace;
  }

  const ownedWorkspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.ownerId, userId),
  });

  return ownedWorkspace;
}

// DELETE /api/settings/api-keys/[keyId] - Revoke API key
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 404 }
      );
    }

    const { keyId } = await params;

    // Verify the key belongs to the workspace
    const key = await getApiKey(keyId, workspace.id);
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const revoked = await revokeApiKey(keyId, workspace.id);

    if (!revoked) {
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
