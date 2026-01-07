import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "new_response",
  "daily_digest",
  "weekly_report",
  "form_published",
  "team_invite",
  "response_limit_warning",
  "form_closed",
  "webhook_failed",
  "mention",
  "comment",
]);

// Notification priority
export const notificationPriorityEnum = pgEnum("notification_priority", [
  "low",
  "normal",
  "high",
]);

// In-app notifications table
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    priority: notificationPriorityEnum("priority").default("normal"),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    link: text("link"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    read: boolean("read").default(false).notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_user_unread_idx").on(table.userId, table.read),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Email notification preferences
export const emailPreferences = pgTable("email_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  newResponse: boolean("new_response").default(true),
  dailyDigest: boolean("daily_digest").default(false),
  weeklyReport: boolean("weekly_report").default(true),
  formPublished: boolean("form_published").default(true),
  teamInvite: boolean("team_invite").default(true),
  responseLimitWarning: boolean("response_limit_warning").default(true),
  formClosed: boolean("form_closed").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email preferences relations
export const emailPreferencesRelations = relations(
  emailPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [emailPreferences.userId],
      references: [users.id],
    }),
  })
);

// Notification digest tracking (for daily/weekly digests)
export const notificationDigests = pgTable("notification_digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'daily' | 'weekly'
  sentAt: timestamp("sent_at").notNull(),
  formsSummary: jsonb("forms_summary").$type<
    Array<{
      formId: string;
      formTitle: string;
      responseCount: number;
    }>
  >(),
  totalResponses: jsonb("total_responses").default(0),
});

// Type exports
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type EmailPreference = typeof emailPreferences.$inferSelect;
export type NewEmailPreference = typeof emailPreferences.$inferInsert;
export type NotificationDigest = typeof notificationDigests.$inferSelect;
export type NewNotificationDigest = typeof notificationDigests.$inferInsert;

// Notification type (string literal)
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationPriority =
  (typeof notificationPriorityEnum.enumValues)[number];
