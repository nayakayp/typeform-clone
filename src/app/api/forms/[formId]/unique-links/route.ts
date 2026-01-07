import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createUniqueLinks,
  getUniqueLinks,
  buildUniqueLinkUrl,
} from "@/lib/access";

const createLinksSchema = z.object({
  links: z.array(
    z.object({
      email: z.string().email().optional(),
      name: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
      expiresAt: z.string().optional(),
      maxUses: z.number().min(1).optional(),
    })
  ),
});

// GET /api/forms/[formId]/unique-links - List unique links
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const includeUsed = searchParams.get("includeUsed") !== "false";

    const links = await getUniqueLinks(formId, { limit, offset, includeUsed });

    // Add full URLs
    const linksWithUrls = links.map((link) => ({
      ...link,
      url: buildUniqueLinkUrl(form.slug, link.token),
    }));

    return NextResponse.json({ links: linksWithUrls });
  } catch (error) {
    console.error("Failed to get unique links:", error);
    return NextResponse.json(
      { error: "Failed to get unique links" },
      { status: 500 }
    );
  }
}

// POST /api/forms/[formId]/unique-links - Create unique links
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = createLinksSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const links = await createUniqueLinks(
      formId,
      validation.data.links.map((l) => ({
        ...l,
        expiresAt: l.expiresAt ? new Date(l.expiresAt) : undefined,
      }))
    );

    // Add full URLs
    const linksWithUrls = links.map((link) => ({
      ...link,
      url: buildUniqueLinkUrl(form.slug, link.token),
    }));

    return NextResponse.json({ links: linksWithUrls }, { status: 201 });
  } catch (error) {
    console.error("Failed to create unique links:", error);
    return NextResponse.json(
      { error: "Failed to create unique links" },
      { status: 500 }
    );
  }
}
