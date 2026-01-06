import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { themes } from "./themes";
import { questions } from "./questions";
import { responses } from "./responses";
import { webhooks } from "./integrations";
import { formViews, formStats } from "./analytics";

// Form settings type
export interface FormSettings {
  showProgressBar?: boolean;
  showQuestionNumbers?: boolean;
  shuffleQuestions?: boolean;
  oneQuestionPerPage?: boolean;
  allowResponseEditing?: boolean;
  closeAfterSubmission?: boolean;
  responseLimitEnabled?: boolean;
  responseLimit?: number;
  scheduledCloseDate?: string;
}

// Custom theme type
export interface CustomTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  fontFamily?: string;
  backgroundImage?: string;
}

// Forms table
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }).notNull().default("Untitled Form"),
    description: text("description"),
    slug: varchar("slug", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, closed

    // Settings
    settings: jsonb("settings").default({
      showProgressBar: true,
      showQuestionNumbers: true,
      shuffleQuestions: false,
      oneQuestionPerPage: true,
    }).$type<FormSettings>(),

    // Access Control
    isPublic: boolean("is_public").default(true),
    password: varchar("password", { length: 255 }),
    maxResponses: integer("max_responses"),
    closeAt: timestamp("close_at"),
    openAt: timestamp("open_at"),

    // Theming
    themeId: uuid("theme_id").references(() => themes.id),
    customTheme: jsonb("custom_theme").$type<CustomTheme>(),

    // Metadata
    publishedAt: timestamp("published_at"),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("slug_workspace_unique").on(table.workspaceId, table.slug),
  ]
);

// Form relations
export const formsRelations = relations(forms, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [forms.workspaceId],
    references: [workspaces.id],
  }),
  creator: one(users, {
    fields: [forms.createdBy],
    references: [users.id],
  }),
  theme: one(themes, {
    fields: [forms.themeId],
    references: [themes.id],
  }),
  questions: many(questions),
  responses: many(responses),
  versions: many(formVersions),
  webhooks: many(webhooks),
  views: many(formViews),
  stats: one(formStats),
}));

// Form versions for history
export const formVersions = pgTable("form_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").notNull().$type<Record<string, unknown>>(), // Complete form + questions state
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Form version relations
export const formVersionsRelations = relations(formVersions, ({ one }) => ({
  form: one(forms, {
    fields: [formVersions.formId],
    references: [forms.id],
  }),
  creator: one(users, {
    fields: [formVersions.createdBy],
    references: [users.id],
  }),
}));

export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;
export type FormVersion = typeof formVersions.$inferSelect;
export type NewFormVersion = typeof formVersions.$inferInsert;
