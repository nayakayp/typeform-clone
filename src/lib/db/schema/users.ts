import {
  pgTable,
  uuid,
  varchar,
  boolean,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sessions, accounts } from "./auth";
import { workspaceMembers, workspaces } from "./workspaces";
import { forms } from "./forms";
import { formVersions } from "./versions";

// User role enum
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "super_admin",
]);

// User settings theme enum
export const userThemeEnum = pgEnum("user_theme", ["light", "dark", "system"]);

// User settings email frequency enum
export const emailFrequencyEnum = pgEnum("email_frequency", [
  "realtime",
  "daily",
  "weekly",
  "never",
]);

// User status enum
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  role: userRoleEnum("role").default("user").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User settings table
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  theme: userThemeEnum("theme").default("system").notNull(),
  defaultLanguage: varchar("default_language", { length: 10 })
    .default("en")
    .notNull(),
  emailFrequency: emailFrequencyEnum("email_frequency")
    .default("daily")
    .notNull(),
  timezone: varchar("timezone", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User settings relations
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  createdForms: many(forms),
  formVersions: many(formVersions),
  settings: one(userSettings),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSettingsRecord = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
