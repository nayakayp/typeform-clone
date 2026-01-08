import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, questions, responses, answers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

interface AnswerInput {
  questionId: string;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  dateValue?: string;
  jsonValue?: unknown;
  fileUrls?: Array<{
    url: string;
    name: string;
    size: number;
    type: string;
  }>;
}

interface SubmitRequest {
  answers: AnswerInput[];
  respondentId?: string;
  email?: string;
  hiddenFields?: Record<string, string | number | boolean>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// POST /api/public/forms/[slug]/submit - Submit a response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: SubmitRequest = await request.json();

    // Find form by slug
    const form = await db.query.forms.findFirst({
      where: and(
        eq(forms.slug, slug),
        eq(forms.status, "published")
      ),
      with: {
        questions: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Check if form is closed
    if (form.closeAt && new Date(form.closeAt) < new Date()) {
      return NextResponse.json(
        { error: "This form is no longer accepting responses" },
        { status: 410 }
      );
    }

    // Check if form is scheduled to open later
    if (form.openAt && new Date(form.openAt) > new Date()) {
      return NextResponse.json(
        { error: "This form is not yet open for responses" },
        { status: 403 }
      );
    }

    // Get device info from headers
    const userAgent = request.headers.get("user-agent") || undefined;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               undefined;

    // Generate anonymous respondent ID if not provided
    const respondentId = body.respondentId || `anon_${nanoid(16)}`;

    // Create response
    const [newResponse] = await db
      .insert(responses)
      .values({
        formId: form.id,
        respondentId,
        email: body.email,
        status: "completed",
        completedAt: new Date(),
        ipAddress: ip,
        userAgent,
        hiddenFields: body.hiddenFields || {},
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
      })
      .returning();

    // Validate answers against form questions
    const questionIds = new Set(form.questions.map((q) => q.id));
    const validAnswers = body.answers.filter((a) => questionIds.has(a.questionId));

    // Insert answers
    if (validAnswers.length > 0) {
      await db.insert(answers).values(
        validAnswers.map((answer) => ({
          responseId: newResponse.id,
          questionId: answer.questionId,
          textValue: answer.textValue,
          numberValue: answer.numberValue?.toString(),
          booleanValue: answer.booleanValue,
          dateValue: answer.dateValue ? new Date(answer.dateValue) : undefined,
          jsonValue: answer.jsonValue,
          fileUrls: answer.fileUrls || [],
        }))
      );
    }

    return NextResponse.json({
      success: true,
      responseId: newResponse.id,
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
