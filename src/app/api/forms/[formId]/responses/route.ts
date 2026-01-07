import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, responses, answers } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// GET /api/forms/[formId]/responses - List responses for a form
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Verify user owns the form
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Parse query params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(responses.formId, formId)];
    if (status) {
      whereConditions.push(eq(responses.status, status));
    }

    // Fetch responses with answers
    const formResponses = await db.query.responses.findMany({
      where: and(...whereConditions),
      orderBy: [desc(responses.createdAt)],
      limit,
      offset,
      with: {
        answers: true,
      },
    });

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(responses)
      .where(and(...whereConditions));
    const total = Number(totalResult[0]?.count || 0);

    return NextResponse.json({
      responses: formResponses.map((r) => ({
        id: r.id,
        formId: r.formId,
        status: r.status,
        email: r.email,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        answers: r.answers.map((a) => ({
          questionId: a.questionId,
          textValue: a.textValue,
          numberValue: a.numberValue,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
