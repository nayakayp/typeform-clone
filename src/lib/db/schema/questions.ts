import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { forms } from "./forms";
import { answers } from "./responses";

// Question type enum
export const questionTypeEnum = pgEnum("question_type", [
  // Basic
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "url",
  "date",
  "time",
  // Selection
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "picture_choice",
  "yes_no",
  "rating",
  "opinion_scale",
  "nps",
  "ranking",
  "matrix",
  // Media
  "file_upload",
  "signature",
  "video_recording",
  "audio_recording",
  // Content
  "welcome_screen",
  "statement",
  "thank_you_screen",
  "redirect",
  "video_embed",
  "image_block",
  // Advanced
  "payment",
  "calendly",
  "address",
  "legal",
  "captcha",
]);

// Question settings type
export interface QuestionSettings {
  // Common
  showDescription?: boolean;
  // Number
  min?: number;
  max?: number;
  step?: number;
  // Text
  maxLength?: number;
  minLength?: number;
  // Multiple choice
  allowOther?: boolean;
  randomizeOptions?: boolean;
  multipleSelection?: boolean;
  // Rating
  ratingScale?: number;
  ratingShape?: "star" | "heart" | "thumb";
  // Opinion scale
  scaleMin?: number;
  scaleMax?: number;
  leftLabel?: string;
  rightLabel?: string;
  // File upload
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  // Yes/No
  yesLabel?: string;
  noLabel?: string;
  // Statement
  buttonText?: string;
  // Audio/Video recording
  maxDuration?: string;
}

// Question validations type
export interface QuestionValidations {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customError?: string;
}

// Logic jump type
export interface LogicJump {
  conditions?: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
  action?: "jump" | "hide" | "show";
  target?: string;
}

// Question groups
export const questionGroups = pgTable("question_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Question group relations
export const questionGroupsRelations = relations(
  questionGroups,
  ({ one, many }) => ({
    form: one(forms, {
      fields: [questionGroups.formId],
      references: [forms.id],
    }),
    questions: many(questions),
  })
);

// Questions table
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  type: questionTypeEnum("type").notNull(),
  title: text("title"),
  description: text("description"),
  placeholder: varchar("placeholder", { length: 255 }),

  // Order & Grouping
  order: integer("order").notNull(),
  groupId: uuid("group_id").references(() => questionGroups.id),

  // Validation
  required: boolean("required").default(false),
  validations: jsonb("validations").default({}).$type<QuestionValidations>(),

  // Type-specific settings
  settings: jsonb("settings").default({}).$type<QuestionSettings>(),

  // Media
  image: text("image"),
  video: text("video"),

  // Logic
  logicJump: jsonb("logic_jump").$type<LogicJump>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Question relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
  form: one(forms, {
    fields: [questions.formId],
    references: [forms.id],
  }),
  group: one(questionGroups, {
    fields: [questions.groupId],
    references: [questionGroups.id],
  }),
  options: many(questionOptions),
  answers: many(answers),
}));

// Question options (for multiple choice, checkboxes, etc.)
export const questionOptions = pgTable("question_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 500 }).notNull(),
  value: varchar("value", { length: 255 }),
  image: text("image"),
  order: integer("order").notNull(),
});

// Question option relations
export const questionOptionsRelations = relations(
  questionOptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionOptions.questionId],
      references: [questions.id],
    }),
  })
);

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuestionGroup = typeof questionGroups.$inferSelect;
export type NewQuestionGroup = typeof questionGroups.$inferInsert;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;
