import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { trackFormEvent } from "@/lib/analytics";
import { z } from "zod";

const trackEventSchema = z.object({
  sessionId: z.string().min(1),
  eventType: z.enum([
    "view",
    "start",
    "complete",
    "drop_off",
    "question_view",
    "question_answer",
  ]),
  visitorId: z.string().optional(),
  questionId: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  referrer: z.string().optional(),
  timeSpent: z.number().optional(),
});

// POST /api/forms/[formId]/analytics/track - Track form event
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    // Verify form exists and is published
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = trackEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, eventType, ...metadata } = validation.data;

    await trackFormEvent(formId, sessionId, eventType, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
