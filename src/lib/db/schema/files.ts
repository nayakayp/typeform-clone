import { pgTable, uuid, integer, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { responses } from "./responses";
import { questions } from "./questions";

// Files uploaded by respondents
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id").references(() => responses.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").references(() => questions.id, { onDelete: "set null" }),

  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  storageType: varchar("storage_type", { length: 20 }).default("local").notNull(),
  storageKey: text("storage_key"), // For S3 object key or local path

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("files_response_id_idx").on(table.responseId),
  index("files_question_id_idx").on(table.questionId),
]);

export const filesRelations = relations(files, ({ one }) => ({
  response: one(responses, {
    fields: [files.responseId],
    references: [responses.id],
  }),
  question: one(questions, {
    fields: [files.questionId],
    references: [questions.id],
  }),
}));

// File upload settings types for questions
export interface FileUploadSettings {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types like 'image/*', 'application/pdf'
  allowedExtensions?: string[]; // '.pdf', '.doc', etc.
}

export interface SignatureSettings {
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  showTypedOption?: boolean;
}

export interface VideoRecordingSettings {
  maxDuration?: number; // seconds
  minDuration?: number;
  allowUpload?: boolean;
  quality?: "low" | "medium" | "high";
}

export interface AudioRecordingSettings {
  maxDuration?: number;
  minDuration?: number;
  allowUpload?: boolean;
  showWaveform?: boolean;
}
