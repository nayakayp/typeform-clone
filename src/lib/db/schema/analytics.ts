import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { forms } from "./forms";

// Form views table (individual view events)
export const formViews = pgTable("form_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Form view relations
export const formViewsRelations = relations(formViews, ({ one }) => ({
  form: one(forms, {
    fields: [formViews.formId],
    references: [forms.id],
  }),
}));

// Form stats table (aggregated statistics, updated periodically)
export const formStats = pgTable("form_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" })
    .unique(),
  totalViews: integer("total_views").default(0).notNull(),
  totalStarts: integer("total_starts").default(0).notNull(),
  totalCompletions: integer("total_completions").default(0).notNull(),
  avgCompletionTime: integer("avg_completion_time"), // in seconds
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Form stats relations
export const formStatsRelations = relations(formStats, ({ one }) => ({
  form: one(forms, {
    fields: [formStats.formId],
    references: [forms.id],
  }),
}));

export type FormView = typeof formViews.$inferSelect;
export type NewFormView = typeof formViews.$inferInsert;
export type FormStats = typeof formStats.$inferSelect;
export type NewFormStats = typeof formStats.$inferInsert;
