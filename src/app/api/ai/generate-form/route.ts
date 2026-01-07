import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { generateForm, FormGeneratorInput } from "@/lib/ai";

const generateFormSchema = z.object({
  description: z.string().min(10).max(1000),
  purpose: z.enum(["survey", "feedback", "registration", "quiz", "contact", "other"]).optional(),
  targetAudience: z.string().max(200).optional(),
  questionCount: z.number().min(1).max(20).optional(),
  tone: z.enum(["professional", "friendly", "casual"]).optional(),
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
    const validation = generateFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input: FormGeneratorInput = validation.data;
    const generatedForm = await generateForm(input);

    return NextResponse.json({ form: generatedForm });
  } catch (error) {
    console.error("Failed to generate form:", error);
    return NextResponse.json(
      { error: "Failed to generate form" },
      { status: 500 }
    );
  }
}
