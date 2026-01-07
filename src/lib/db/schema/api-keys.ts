import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "./workspaces";

// API Key permissions
export const API_PERMISSIONS = [
  "forms:read",
  "forms:write",
  "forms:delete",
  "questions:read",
  "questions:write",
  "questions:delete",
  "responses:read",
  "responses:delete",
  "webhooks:read",
  "webhooks:write",
  "webhooks:delete",
  "*", // All permissions
] as const;

export type ApiPermission = (typeof API_PERMISSIONS)[number];

// API Keys table
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    keyHash: varchar("key_hash", { length: 64 }).notNull().unique(),
    prefix: varchar("prefix", { length: 20 }).notNull(),
    suffix: varchar("suffix", { length: 8 }).notNull(), // Last 4 chars for display
    permissions: jsonb("permissions").default(["*"]).$type<ApiPermission[]>(),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("api_keys_workspace_idx").on(table.workspaceId),
    index("api_keys_key_hash_idx").on(table.keyHash),
  ]
);

// API Logs table for usage tracking
export const apiLogs = pgTable(
  "api_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id").references(() => apiKeys.id, {
      onDelete: "set null",
    }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    method: varchar("method", { length: 10 }).notNull(),
    path: varchar("path", { length: 255 }).notNull(),
    status: integer("status").notNull(),
    responseTime: integer("response_time"), // milliseconds
    userAgent: varchar("user_agent", { length: 500 }),
    ip: varchar("ip", { length: 45 }), // IPv6 compatible
    error: varchar("error", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("api_logs_api_key_idx").on(table.apiKeyId),
    index("api_logs_workspace_idx").on(table.workspaceId),
    index("api_logs_created_at_idx").on(table.createdAt),
  ]
);

// Relations
export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [apiKeys.workspaceId],
    references: [workspaces.id],
  }),
  logs: many(apiLogs),
}));

export const apiLogsRelations = relations(apiLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiLogs.apiKeyId],
    references: [apiKeys.id],
  }),
  workspace: one(workspaces, {
    fields: [apiLogs.workspaceId],
    references: [workspaces.id],
  }),
}));

// Type exports
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type ApiLog = typeof apiLogs.$inferSelect;
export type NewApiLog = typeof apiLogs.$inferInsert;
