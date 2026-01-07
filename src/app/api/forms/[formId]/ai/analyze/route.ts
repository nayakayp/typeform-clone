import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, questions, responses, responseAnswers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { analyzeResponses, AnalysisInput } from "@/lib/ai";

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

    // Verify form ownership
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get questions
    const formQuestions = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
      orderBy: (q, { asc }) => [asc(q.order)],
    });

    // Get responses with answers
    const formResponses = await db.query.responses.findMany({
      where: and(
        eq(responses.formId, formId),
        eq(responses.status, "completed")
      ),
      with: {
        answers: true,
      },
      limit: 500, // Limit for AI analysis
    });

    if (formResponses.length < 5) {
      return NextResponse.json(
        { error: "Need at least 5 responses for meaningful analysis" },
        { status: 400 }
      );
    }

    // Prepare input for analysis
    const input: AnalysisInput = {
      formTitle: form.title,
      questions: formQuestions.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
      })),
      responses: formResponses.map((r) =>
        r.answers.map((a) => ({
          questionId: a.questionId,
          value: a.value as string | number | string[],
        }))
      ),
    };

    const analysis = await analyzeResponses(input);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Failed to analyze responses:", error);
    return NextResponse.json(
      { error: "Failed to analyze responses" },
      { status: 500 }
    );
  }
}
