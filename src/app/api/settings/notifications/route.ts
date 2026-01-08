import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { emailPreferences } from "@/lib/db/schema";

// Schema for updating email preferences
const updateNotificationsSchema = z.object({
  newResponse: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  formPublished: z.boolean().optional(),
  teamInvite: z.boolean().optional(),
  responseLimitWarning: z.boolean().optional(),
  formClosed: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

// GET /api/settings/notifications - Get email preferences
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let prefs = await db.query.emailPreferences.findFirst({
      where: eq(emailPreferences.userId, session.user.id),
    });

    // Return default preferences if none exist
    if (!prefs) {
      prefs = {
        id: "",
        userId: session.user.id,
        newResponse: true,
        dailyDigest: false,
        weeklyReport: true,
        formPublished: true,
        teamInvite: true,
        responseLimitWarning: true,
        formClosed: true,
        marketingEmails: false,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ notifications: prefs });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings/notifications - Update email preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateNotificationsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const existing = await db.query.emailPreferences.findFirst({
      where: eq(emailPreferences.userId, session.user.id),
    });

    let updatedPrefs;

    if (existing) {
      // Update existing preferences
      [updatedPrefs] = await db
        .update(emailPreferences)
        .set({
          ...parsed.data,
          updatedAt: new Date(),
        })
        .where(eq(emailPreferences.userId, session.user.id))
        .returning();
    } else {
      // Create new preferences
      [updatedPrefs] = await db
        .insert(emailPreferences)
        .values({
          userId: session.user.id,
          ...parsed.data,
        })
        .returning();
    }

    return NextResponse.json({ notifications: updatedPrefs });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
