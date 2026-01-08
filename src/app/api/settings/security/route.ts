import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import { sessions } from "@/lib/db/schema";

// Schema for actions
const actionSchema = z.object({
  action: z.enum(["change-password"]),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
});

// Parse user agent to get device and browser info
function parseUserAgent(userAgent: string | null): {
  device: string;
  browser: string;
} {
  if (!userAgent) {
    return { device: "Unknown Device", browser: "Unknown Browser" };
  }

  // Detect browser
  let browser = "Unknown Browser";
  if (userAgent.includes("Firefox")) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  } else if (userAgent.includes("Edg")) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  }

  // Detect device
  let device = "Unknown Device";
  if (userAgent.includes("iPhone")) {
    device = "iPhone";
  } else if (userAgent.includes("iPad")) {
    device = "iPad";
  } else if (userAgent.includes("Android")) {
    device = userAgent.includes("Mobile") ? "Android Phone" : "Android Tablet";
  } else if (userAgent.includes("Macintosh")) {
    device = "Mac";
  } else if (userAgent.includes("Windows")) {
    device = "Windows PC";
  } else if (userAgent.includes("Linux")) {
    device = "Linux";
  }

  return { device, browser };
}

// GET /api/settings/security - Get active sessions
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, session.user.id),
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    });

    // Transform sessions to the expected format
    const activeSessions = userSessions
      .filter((s) => new Date(s.expiresAt) > new Date())
      .map((s) => {
        const { device, browser } = parseUserAgent(s.userAgent);
        return {
          id: s.id,
          device,
          browser,
          location: s.ipAddress || "Unknown Location",
          lastActive: s.updatedAt,
          isCurrent: s.id === session.session.id,
        };
      });

    return NextResponse.json({
      sessions: activeSessions,
      twoFactorEnabled: false, // TODO: Implement 2FA check when available
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch security settings" },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/security - Revoke a session
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Don't allow revoking the current session via this endpoint
    if (sessionId === session.session.id) {
      return NextResponse.json(
        { error: "Cannot revoke current session. Use logout instead." },
        { status: 400 }
      );
    }

    // Delete the session (only if it belongs to the current user)
    const deleted = await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, session.user.id),
          ne(sessions.id, session.session.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Session not found or cannot be revoked" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking session:", error);
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}

// POST /api/settings/security - Handle security actions (e.g., change password)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.action === "change-password") {
      // Validate password fields
      if (!parsed.data.currentPassword || !parsed.data.newPassword) {
        return NextResponse.json(
          { error: "Current password and new password are required" },
          { status: 400 }
        );
      }

      // Use better-auth's change password functionality
      try {
        await auth.api.changePassword({
          body: {
            currentPassword: parsed.data.currentPassword,
            newPassword: parsed.data.newPassword,
          },
          headers: await headers(),
        });

        return NextResponse.json({ success: true });
      } catch {
        return NextResponse.json(
          {
            error:
              "Failed to change password. Please check your current password.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error handling security action:", error);
    return NextResponse.json(
      { error: "Failed to process security action" },
      { status: 500 }
    );
  }
}
