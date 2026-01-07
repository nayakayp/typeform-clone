import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { forms } from "./forms";
import { responses } from "./responses";

// Unique links for form distribution
export const uniqueLinks = pgTable(
  "unique_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 100 }).notNull().unique(),
    email: varchar("email", { length: 255 }),
    name: varchar("name", { length: 255 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    expiresAt: timestamp("expires_at"),
    maxUses: integer("max_uses").default(1).notNull(),
    useCount: integer("use_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => ({
    formIdIndex: index("unique_links_form_id_idx").on(table.formId),
    tokenIndex: index("unique_links_token_idx").on(table.token),
  })
);

// Response tracking for single response enforcement
export const responseTracking = pgTable(
  "response_tracking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    fingerprint: varchar("fingerprint", { length: 255 }).notNull(),
    fingerprintType: varchar("fingerprint_type", { length: 20 }).notNull(), // 'cookie', 'ip', 'email', 'user'
    responseId: uuid("response_id").references(() => responses.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueFingerprint: unique().on(table.formId, table.fingerprint, table.fingerprintType),
    formIdIndex: index("response_tracking_form_id_idx").on(table.formId),
    fingerprintIndex: index("response_tracking_fingerprint_idx").on(
      table.fingerprint
    ),
  })
);

// Form access settings (stored as JSON in forms table accessSettings field)
// This type defines the structure
export interface FormAccessSettings {
  // Public/Private
  isPublic: boolean;
  requireAuth?: boolean;

  // Password protection
  passwordProtection?: {
    enabled: boolean;
    passwordHash: string;
    message?: string;
  };

  // Response limits
  responseLimit?: {
    maxResponses: number;
    closedMessage?: string;
    showRemaining?: boolean;
  };

  // Schedule
  schedule?: {
    openAt?: string; // ISO date string
    closeAt?: string;
    timezone?: string;
    beforeOpenMessage?: string;
    afterCloseMessage?: string;
  };

  // Single response
  singleResponse?: {
    enabled: boolean;
    method: "cookie" | "ip" | "email" | "user";
    allowEdit?: boolean;
  };

  // IP restrictions
  ipRestrictions?: {
    allowlist?: string[];
    blocklist?: string[];
    countryRestrictions?: {
      mode: "allow" | "block";
      countries: string[];
    };
  };
}

// Relations
export const uniqueLinksRelations = relations(uniqueLinks, ({ one }) => ({
  form: one(forms, {
    fields: [uniqueLinks.formId],
    references: [forms.id],
  }),
}));

export const responseTrackingRelations = relations(
  responseTracking,
  ({ one }) => ({
    form: one(forms, {
      fields: [responseTracking.formId],
      references: [forms.id],
    }),
    response: one(responses, {
      fields: [responseTracking.responseId],
      references: [responses.id],
    }),
  })
);

// Types
export type UniqueLink = typeof uniqueLinks.$inferSelect;
export type NewUniqueLink = typeof uniqueLinks.$inferInsert;
export type ResponseTracking = typeof responseTracking.$inferSelect;
export type NewResponseTracking = typeof responseTracking.$inferInsert;
