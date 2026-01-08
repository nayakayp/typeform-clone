import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, questions, questionOptions } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/public/forms/[slug] - Get a public form by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";

    let form;

    if (isPreview) {
      // For preview mode, verify the user owns the form
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required for preview" },
          { status: 401 }
        );
      }

      // Find form by slug without status check, but verify ownership
      form = await db.query.forms.findFirst({
        where: and(eq(forms.slug, slug), eq(forms.createdBy, session.user.id)),
        with: {
          questions: {
            orderBy: [asc(questions.order)],
            with: {
              options: {
                orderBy: [asc(questionOptions.order)],
              },
            },
          },
          theme: true,
        },
      });

      if (!form) {
        return NextResponse.json(
          { error: "Form not found or you don't have access" },
          { status: 404 }
        );
      }
    } else {
      // Normal public access - require published status
      form = await db.query.forms.findFirst({
        where: and(eq(forms.slug, slug), eq(forms.status, "published")),
        with: {
          questions: {
            orderBy: [asc(questions.order)],
            with: {
              options: {
                orderBy: [asc(questionOptions.order)],
              },
            },
          },
          theme: true,
        },
      });

      if (!form) {
        return NextResponse.json(
          { error: "Form not found" },
          { status: 404 }
        );
      }

      // Check if form is closed (skip for preview)
      if (form.closeAt && new Date(form.closeAt) < new Date()) {
        return NextResponse.json(
          { error: "This form is no longer accepting responses" },
          { status: 410 }
        );
      }

      // Check if form is scheduled to open later (skip for preview)
      if (form.openAt && new Date(form.openAt) > new Date()) {
        return NextResponse.json(
          { error: "This form is not yet open for responses" },
          { status: 403 }
        );
      }
    }

    // Return form data (excluding sensitive fields)
    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        settings: form.settings,
        customTheme: form.customTheme,
        theme: form.theme,
        questions: form.questions.map((q) => ({
          id: q.id,
          type: q.type,
          title: q.title,
          description: q.description,
          placeholder: q.placeholder,
          order: q.order,
          required: q.required,
          validations: q.validations,
          settings: q.settings,
          image: q.image,
          video: q.video,
          options: q.options?.map((o) => ({
            id: o.id,
            label: o.label,
            value: o.value,
            image: o.image,
            order: o.order,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching public form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}
