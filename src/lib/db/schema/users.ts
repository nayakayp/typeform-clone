import {
  pgTable,
  uuid,
  varchar,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sessions, accounts } from "./auth";
import { workspaceMembers, workspaces } from "./workspaces";
import { forms, formVersions } from "./forms";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  name: varchar("name", { length: 255 }),
  image: text("image"),
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
