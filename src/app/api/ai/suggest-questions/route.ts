import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { suggestQuestions, QuestionSuggestionInput } from "@/lib/ai";

const suggestQuestionsSchema = z.object({
  formTitle: z.string().min(1).max(200),
  formDescription: z.string().max(500).optional(),
  formPurpose: z.string().max(100).optional(),
  existingQuestions: z.array(
    z.object({
      title: z.string(),
      type: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = suggestQuestionsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input: QuestionSuggestionInput = validation.data;
    const suggestions = await suggestQuestions(input);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Failed to suggest questions:", error);
    return NextResponse.json(
      { error: "Failed to suggest questions" },
      { status: 500 }
    );
  }
}
