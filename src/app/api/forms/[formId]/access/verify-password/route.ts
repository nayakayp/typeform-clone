import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verifyPassword, getResponseCount } from "@/lib/access";
import type { FormAccessSettings } from "@/lib/db/schema";

const verifyPasswordSchema = z.object({
  password: z.string().min(1),
});

// POST /api/forms/[formId]/access/verify-password - Verify form password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = verifyPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const settings = (form.settings as { access?: FormAccessSettings })?.access;

    if (!settings?.passwordProtection?.enabled) {
      return NextResponse.json({ valid: true });
    }

    const valid = await verifyPassword(
      validation.data.password,
      settings.passwordProtection.passwordHash
    );

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("Failed to verify password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
