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

// Integration tokens (for OAuth)
export const integrationTokens = pgTable("integration_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  integrationId: uuid("integration_id")
    .notNull()
    .references(() => integrations.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const integrationTokensRelations = relations(integrationTokens, ({ one }) => ({
  integration: one(integrations, {
    fields: [integrationTokens.integrationId],
    references: [integrations.id],
  }),
}));

// Form-level integrations (connects forms to workspace integrations)
export const formIntegrations = pgTable("form_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  integrationId: uuid("integration_id")
    .notNull()
    .references(() => integrations.id, { onDelete: "cascade" }),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formIntegrationsRelations = relations(formIntegrations, ({ one }) => ({
  form: one(forms, {
    fields: [formIntegrations.formId],
    references: [forms.id],
  }),
  integration: one(integrations, {
    fields: [formIntegrations.integrationId],
    references: [integrations.id],
  }),
}));

// Integration logs
export const integrationLogs = pgTable("integration_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  formIntegrationId: uuid("form_integration_id")
    .notNull()
    .references(() => formIntegrations.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  message: text("message"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrationLogsRelations = relations(integrationLogs, ({ one }) => ({
  formIntegration: one(formIntegrations, {
    fields: [integrationLogs.formIntegrationId],
    references: [formIntegrations.id],
  }),
}));

// Zapier subscriptions
export const zapierSubscriptions = pgTable("zapier_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  hookUrl: text("hook_url").notNull(),
  event: varchar("event", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const zapierSubscriptionsRelations = relations(zapierSubscriptions, ({ one }) => ({
  form: one(forms, {
    fields: [zapierSubscriptions.formId],
    references: [forms.id],
  }),
}));

// Integration provider constants
export const INTEGRATION_PROVIDERS = [
  "google_sheets",
  "slack",
  "zapier",
  "airtable",
  "hubspot",
  "mailchimp",
] as const;

export type IntegrationProvider = typeof INTEGRATION_PROVIDERS[number];

// Config types for different providers
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetId: number;
  sheetName: string;
  mappings: Array<{
    questionId: string;
    columnIndex: number;
    columnLetter: string;
  }>;
  includeHeaders: boolean;
  autoSync: boolean;
}

export interface SlackConfig {
  channelId: string;
  channelName: string;
  messageTemplate: string;
  notifyOn: Array<"response.created" | "response.completed">;
  includePreview: boolean;
}

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type FormIntegration = typeof formIntegrations.$inferSelect;
export type NewFormIntegration = typeof formIntegrations.$inferInsert;
export type IntegrationToken = typeof integrationTokens.$inferSelect;
export type ZapierSubscription = typeof zapierSubscriptions.$inferSelect;
