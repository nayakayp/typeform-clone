import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { forms } from "./forms";
import { questions } from "./questions";

// Hidden fields type
export interface HiddenFields {
  [key: string]: string | number | boolean | undefined;
}

// Responses table
export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),

  // Respondent info
  respondentId: varchar("respondent_id", { length: 100 }), // Anonymous ID or user ID
  email: varchar("email", { length: 255 }),

  // Status
  status: varchar("status", { length: 20 }).notNull().default("in_progress"), // in_progress, completed, partial

  // Timestamps
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),

  // Device info
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  device: varchar("device", { length: 50 }),
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),

  // UTM tracking
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),

  // Hidden fields
  hiddenFields: jsonb("hidden_fields").default({}).$type<HiddenFields>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Response relations
export const responsesRelations = relations(responses, ({ one, many }) => ({
  form: one(forms, {
    fields: [responses.formId],
    references: [forms.id],
  }),
  answers: many(answers),
}));

// File URL type
export interface FileUrl {
  url: string;
  name: string;
  size: number;
  type: string;
}

// Answers table
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => responses.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),

  // Answer value (flexible)
  textValue: text("text_value"),
  numberValue: numeric("number_value", { precision: 20, scale: 6 }),
  booleanValue: boolean("boolean_value"),
  dateValue: timestamp("date_value"),
  jsonValue: jsonb("json_value").$type<unknown>(), // For complex answers like file uploads, multiple selections

  // File uploads
  fileUrls: jsonb("file_urls").default([]).$type<FileUrl[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Answer relations
export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, {
    fields: [answers.responseId],
    references: [responses.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
