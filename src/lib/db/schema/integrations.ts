import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "./workspaces";
import { forms } from "./forms";

// Webhook events type
export type WebhookEvent =
  | "response.created"
  | "response.completed"
  | "response.updated"
  | "form.published"
  | "form.closed";

// Webhooks table
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: varchar("secret", { length: 255 }),
  events: jsonb("events").default(["response.completed"]).$type<
    WebhookEvent[]
  >(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhook relations
export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  form: one(forms, {
    fields: [webhooks.formId],
    references: [forms.id],
  }),
  logs: many(webhookLogs),
}));

// Webhook logs table
export const webhookLogs = pgTable("webhook_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  webhookId: uuid("webhook_id")
    .notNull()
    .references(() => webhooks.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 50 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhook log relations
export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookLogs.webhookId],
    references: [webhooks.id],
  }),
}));

// Integration config type
export interface IntegrationConfig {
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
}

// Integrations table
export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(), // google_sheets, slack, zapier, etc.
  config: jsonb("config").notNull().$type<IntegrationConfig>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Integration relations
export const integrationsRelations = relations(integrations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [integrations.workspaceId],
    references: [workspaces.id],
  }),
}));

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
