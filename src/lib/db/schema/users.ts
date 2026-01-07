import {
  pgTable,
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
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "super_admin"]);

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

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  createdForms: many(forms),
  formVersions: many(formVersions),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
