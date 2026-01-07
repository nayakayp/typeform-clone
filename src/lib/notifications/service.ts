import { db } from "@/lib/db";
import {
  notifications,
  NewNotification,
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/lib/db/schema";
import { eq, and, desc, count, isNull, lt } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Create a new notification
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  options: {
    message?: string;
    link?: string;
    data?: Record<string, unknown>;
    priority?: NotificationPriority;
  } = {}
): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      message: options.message,
      link: options.link,
      data: options.data,
      priority: options.priority || "normal",
    })
    .returning();

  return notification;
}

// Get notifications for a user
export async function getNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<Notification[]> {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const whereClause = unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.read, false))
    : eq(notifications.userId, userId);

  return db.query.notifications.findMany({
    where: whereClause,
    orderBy: [desc(notifications.createdAt)],
    limit,
    offset,
  });
}

// Get unread notification count
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false))
    );

  return result?.count || 0;
}

// Mark a notification as read
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning();

  return result.length > 0;
}

// Mark all notifications as read
export async function markAllAsRead(userId: string): Promise<number> {
  const result = await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false))
    )
    .returning();

  return result.length;
}

// Delete a notification
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning();

  return result.length > 0;
}

// Delete old notifications (cleanup job)
export async function deleteOldNotifications(
  olderThanDays: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.read, true),
        lt(notifications.createdAt, cutoffDate)
      )
    )
    .returning();

  return result.length;
}

// Helper: Create new response notification
export async function notifyNewResponse(
  userId: string,
  formTitle: string,
  formId: string,
  responseId: string
): Promise<Notification> {
  return createNotification(userId, "new_response", `New response received`, {
    message: `Someone submitted a response to "${formTitle}"`,
    link: `${APP_URL}/forms/${formId}/responses/${responseId}`,
    data: { formId, responseId, formTitle },
  });
}

// Helper: Create form published notification
export async function notifyFormPublished(
  userId: string,
  formTitle: string,
  formId: string,
  slug: string
): Promise<Notification> {
  return createNotification(userId, "form_published", `Form published`, {
    message: `"${formTitle}" is now live and accepting responses`,
    link: `${APP_URL}/f/${slug}`,
    data: { formId, formTitle, slug },
  });
}

// Helper: Create team invite notification
export async function notifyTeamInvite(
  userId: string,
  workspaceName: string,
  inviterName: string,
  inviteToken: string
): Promise<Notification> {
  return createNotification(userId, "team_invite", `Team invitation`, {
    message: `${inviterName} invited you to join ${workspaceName}`,
    link: `${APP_URL}/invite/${inviteToken}`,
    data: { workspaceName, inviterName, inviteToken },
  });
}

// Helper: Create response limit warning notification
export async function notifyResponseLimitWarning(
  userId: string,
  formTitle: string,
  formId: string,
  currentCount: number,
  maxCount: number
): Promise<Notification> {
  const percentage = Math.round((currentCount / maxCount) * 100);

  return createNotification(
    userId,
    "response_limit_warning",
    `Response limit warning`,
    {
      message: `"${formTitle}" has used ${percentage}% of its response limit`,
      link: `${APP_URL}/forms/${formId}/settings`,
      data: { formId, formTitle, currentCount, maxCount, percentage },
      priority: percentage >= 90 ? "high" : "normal",
    }
  );
}

// Helper: Create webhook failed notification
export async function notifyWebhookFailed(
  userId: string,
  formTitle: string,
  formId: string,
  webhookUrl: string,
  error: string
): Promise<Notification> {
  return createNotification(userId, "webhook_failed", `Webhook delivery failed`, {
    message: `Failed to deliver webhook for "${formTitle}"`,
    link: `${APP_URL}/forms/${formId}/settings/webhooks`,
    data: { formId, formTitle, webhookUrl, error },
    priority: "high",
  });
}
