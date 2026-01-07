import { pgTable, uuid, integer, text, varchar, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { forms } from "./forms";
import { users } from "./users";

// Form snapshot type stored in versions
export interface FormSnapshot {
  title: string;
  description: string | null;
  settings: Record<string, unknown>;
  questions: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    required: boolean;
    order: number;
    settings: Record<string, unknown>;
    options?: Array<{
      id: string;
      value: string;
      order: number;
    }>;
  }>;
  theme?: Record<string, unknown>;
}

// Form versions for version history
export const formVersions = pgTable("form_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").$type<FormSnapshot>().notNull(),
  changeDescription: text("change_description"),
  label: varchar("label", { length: 100 }),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("form_versions_form_id_idx").on(table.formId),
  index("form_versions_form_version_idx").on(table.formId, table.version),
]);

export const formVersionsRelations = relations(formVersions, ({ one }) => ({
  form: one(forms, {
    fields: [formVersions.formId],
    references: [forms.id],
  }),
  createdByUser: one(users, {
    fields: [formVersions.createdBy],
    references: [users.id],
  }),
}));

// Template categories
export const TEMPLATE_CATEGORIES = [
  "surveys",
  "feedback",
  "registration",
  "quizzes",
  "contact",
  "applications",
  "events",
  "research",
  "orders",
  "leads",
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

// Form templates
export const formTemplates = pgTable("form_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id"), // null = global template
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).$type<TemplateCategory>(),
  thumbnail: text("thumbnail"),
  isPublic: boolean("is_public").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  snapshot: jsonb("snapshot").$type<FormSnapshot>().notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("form_templates_workspace_idx").on(table.workspaceId),
  index("form_templates_category_idx").on(table.category),
  index("form_templates_public_idx").on(table.isPublic),
]);

export const formTemplatesRelations = relations(formTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [formTemplates.createdBy],
    references: [users.id],
  }),
}));
