import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, responses, workspaces } from "@/lib/db/schema";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/forms - List forms for the current user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Get user's workspaces
    const userWorkspaces = await db.query.workspaces.findMany({
      where: eq(workspaces.ownerId, session.user.id),
      columns: { id: true },
    });

    const workspaceIds = userWorkspaces.map((w) => w.id);

    if (workspaceIds.length === 0) {
      return NextResponse.json({ forms: [] });
    }

    // Build query conditions
    const conditions = [
      sql`${forms.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`,
    ];

    if (search) {
      conditions.push(ilike(forms.title, `%${search}%`));
    }

    if (status && status !== "all") {
      conditions.push(eq(forms.status, status));
    }

    // Get forms with response counts
    const formsList = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
        status: forms.status,
        slug: forms.slug,
        createdAt: forms.createdAt,
        updatedAt: forms.updatedAt,
        responseCount: sql<number>`(
          SELECT COUNT(*)::int FROM responses WHERE responses.form_id = ${forms.id}
        )`,
      })
      .from(forms)
      .where(and(...conditions))
      .orderBy(desc(forms.updatedAt));

    // Format response
    const formsWithCounts = formsList.map((form) => ({
      ...form,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      _count: {
        responses: form.responseCount,
      },
    }));

    return NextResponse.json({ forms: formsWithCounts });
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

// POST /api/forms - Create a new form
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title = "Untitled Form", workspaceId } = body;

    // Get or create default workspace
    let targetWorkspaceId = workspaceId;

    if (!targetWorkspaceId) {
      // Find user's first workspace or create one
      const existingWorkspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.ownerId, session.user.id),
      });

      if (existingWorkspace) {
        targetWorkspaceId = existingWorkspace.id;
      } else {
        // Create default workspace
        const [newWorkspace] = await db
          .insert(workspaces)
          .values({
            name: "My Workspace",
            ownerId: session.user.id,
            slug: `workspace-${nanoid(8)}`,
          })
          .returning();
        targetWorkspaceId = newWorkspace.id;
      }
    }

    // Create the form
    const slug = `form-${nanoid(8)}`;
    const [newForm] = await db
      .insert(forms)
      .values({
        title,
        slug,
        workspaceId: targetWorkspaceId,
        createdBy: session.user.id,
        status: "draft",
      })
      .returning();

    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (error) {
    console.error("Failed to create form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}
