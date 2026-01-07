import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  createApiKey,
  listApiKeys,
} from "@/lib/api/keys";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Schema for creating API key
const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).default(["*"]),
});

// Helper to get user's workspace
async function getUserWorkspace(userId: string) {
  // First try to find a workspace where user is a member
  const membership = await db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.userId, userId),
    with: { workspace: true },
  });

  if (membership) {
    return membership.workspace;
  }

  // If no membership, find workspace where user is owner
  const ownedWorkspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.ownerId, userId),
  });

  return ownedWorkspace;
}

// GET /api/settings/api-keys - List API keys
export async function GET() {
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

    const keys = await listApiKeys(workspace.id);

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/settings/api-keys - Create API key
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createKeySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { apiKey, plainTextKey } = await createApiKey(
      workspace.id,
      parsed.data.name,
      parsed.data.permissions as ("*" | "forms:read" | "forms:write")[],
    );

    return NextResponse.json({ apiKey, plainTextKey });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
