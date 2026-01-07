import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.user.id, { limit: 50 }),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
