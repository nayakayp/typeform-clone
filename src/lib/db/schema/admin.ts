import { pgTable, uuid, integer, text, varchar, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Feature flags for controlling feature rollout
export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").default(false).notNull(),
  rolloutPercentage: integer("rollout_percentage").default(0).notNull(),
  targetUsers: jsonb("target_users").$type<string[]>(),
  targetWorkspaces: jsonb("target_workspaces").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("feature_flags_name_idx").on(table.name),
]);

// Admin activity logs
export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }),
  targetId: uuid("target_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("admin_logs_admin_id_idx").on(table.adminId),
  index("admin_logs_action_idx").on(table.action),
  index("admin_logs_created_at_idx").on(table.createdAt),
]);

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

// User roles enum
export type UserRole = "user" | "admin" | "super_admin";

// User status enum
export type UserStatus = "active" | "suspended" | "pending";

// Admin action types
export type AdminAction =
  | "user.view"
  | "user.update"
  | "user.suspend"
  | "user.unsuspend"
  | "user.delete"
  | "user.impersonate"
  | "user.password_reset"
  | "form.view"
  | "form.delete"
  | "form.flag"
  | "feature_flag.toggle"
  | "feature_flag.update"
  | "subscription.update"
  | "settings.update";
