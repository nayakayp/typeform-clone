import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { userSettings } from "@/lib/db/schema";

// Schema for updating preferences
const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  defaultLanguage: z.string().min(2).max(10).optional(),
  emailFrequency: z.enum(["realtime", "daily", "weekly", "never"]).optional(),
  timezone: z.string().max(100).nullable().optional(),
});

// GET /api/settings/preferences - Get user preferences
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let prefs = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    // Return default preferences if none exist
    if (!prefs) {
      prefs = {
        id: "",
        userId: session.user.id,
        theme: "system",
        defaultLanguage: "en",
        emailFrequency: "daily",
        timezone: null,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ preferences: prefs });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updatePreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    let updatedPrefs;

    if (existing) {
      // Update existing settings
      [updatedPrefs] = await db
        .update(userSettings)
        .set({
          ...parsed.data,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.user.id))
        .returning();
    } else {
      // Create new settings
      [updatedPrefs] = await db
        .insert(userSettings)
        .values({
          userId: session.user.id,
          theme: parsed.data.theme ?? "system",
          defaultLanguage: parsed.data.defaultLanguage ?? "en",
          emailFrequency: parsed.data.emailFrequency ?? "daily",
          timezone: parsed.data.timezone ?? null,
        })
        .returning();
    }

    return NextResponse.json({ preferences: updatedPrefs });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
