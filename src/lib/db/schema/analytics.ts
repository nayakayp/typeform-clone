import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  date,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { forms } from "./forms";
import { questions } from "./questions";

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

// Daily aggregated analytics for forms
export const formAnalyticsDaily = pgTable(
  "form_analytics_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    views: integer("views").default(0).notNull(),
    uniqueViews: integer("unique_views").default(0).notNull(),
    starts: integer("starts").default(0).notNull(),
    completions: integer("completions").default(0).notNull(),
    avgCompletionTime: integer("avg_completion_time"), // in seconds
    totalCompletionTime: integer("total_completion_time").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDateForm: unique().on(table.formId, table.date),
    dateIndex: index("form_analytics_daily_date_idx").on(table.date),
    formIdIndex: index("form_analytics_daily_form_id_idx").on(table.formId),
  })
);

// Device and browser breakdown
export const formDeviceAnalytics = pgTable(
  "form_device_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    deviceType: varchar("device_type", { length: 50 }).notNull(),
    browser: varchar("browser", { length: 100 }),
    os: varchar("os", { length: 100 }),
    count: integer("count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDeviceFormDate: unique().on(
      table.formId,
      table.date,
      table.deviceType,
      table.browser,
      table.os
    ),
    formIdDateIndex: index("form_device_analytics_form_date_idx").on(
      table.formId,
      table.date
    ),
  })
);

// Geographic analytics
export const formGeoAnalytics = pgTable(
  "form_geo_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }),
    count: integer("count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueGeoFormDate: unique().on(
      table.formId,
      table.date,
      table.country,
      table.region,
      table.city
    ),
    formIdDateIndex: index("form_geo_analytics_form_date_idx").on(
      table.formId,
      table.date
    ),
  })
);

// Traffic source analytics
export const formSourceAnalytics = pgTable(
  "form_source_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    source: varchar("source", { length: 255 }),
    medium: varchar("medium", { length: 100 }),
    campaign: varchar("campaign", { length: 255 }),
    count: integer("count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueSourceFormDate: unique().on(
      table.formId,
      table.date,
      table.source,
      table.medium,
      table.campaign
    ),
    formIdDateIndex: index("form_source_analytics_form_date_idx").on(
      table.formId,
      table.date
    ),
  })
);

// Question-level analytics
export const questionAnalytics = pgTable(
  "question_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    views: integer("views").default(0).notNull(),
    answers: integer("answers").default(0).notNull(),
    skips: integer("skips").default(0).notNull(),
    dropOffs: integer("drop_offs").default(0).notNull(),
    avgTimeSpent: integer("avg_time_spent"),
    totalTimeSpent: integer("total_time_spent").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueQuestionDate: unique().on(table.questionId, table.date),
    formIdDateIndex: index("question_analytics_form_date_idx").on(
      table.formId,
      table.date
    ),
    questionIdIndex: index("question_analytics_question_id_idx").on(
      table.questionId
    ),
  })
);

// Answer distribution for choice/rating questions
export const answerDistribution = pgTable(
  "answer_distribution",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    optionValue: varchar("option_value", { length: 500 }).notNull(),
    count: integer("count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueAnswerDate: unique().on(
      table.questionId,
      table.date,
      table.optionValue
    ),
    questionIdIndex: index("answer_distribution_question_id_idx").on(
      table.questionId
    ),
    formIdDateIndex: index("answer_distribution_form_date_idx").on(
      table.formId,
      table.date
    ),
  })
);

// Form view events (for real-time tracking)
export const formViewEvents = pgTable(
  "form_view_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 100 }).notNull(),
    visitorId: varchar("visitor_id", { length: 100 }),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    questionId: uuid("question_id").references(() => questions.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata").$type<{
      deviceType?: string;
      browser?: string;
      os?: string;
      country?: string;
      region?: string;
      city?: string;
      source?: string;
      medium?: string;
      campaign?: string;
      referrer?: string;
      timeSpent?: number;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    formIdIndex: index("form_view_events_form_id_idx").on(table.formId),
    sessionIndex: index("form_view_events_session_idx").on(table.sessionId),
    createdAtIndex: index("form_view_events_created_at_idx").on(
      table.createdAt
    ),
  })
);

// Relations for new tables
export const formAnalyticsDailyRelations = relations(
  formAnalyticsDaily,
  ({ one }) => ({
    form: one(forms, {
      fields: [formAnalyticsDaily.formId],
      references: [forms.id],
    }),
  })
);

export const formDeviceAnalyticsRelations = relations(
  formDeviceAnalytics,
  ({ one }) => ({
    form: one(forms, {
      fields: [formDeviceAnalytics.formId],
      references: [forms.id],
    }),
  })
);

export const formGeoAnalyticsRelations = relations(
  formGeoAnalytics,
  ({ one }) => ({
    form: one(forms, {
      fields: [formGeoAnalytics.formId],
      references: [forms.id],
    }),
  })
);

export const formSourceAnalyticsRelations = relations(
  formSourceAnalytics,
  ({ one }) => ({
    form: one(forms, {
      fields: [formSourceAnalytics.formId],
      references: [forms.id],
    }),
  })
);

export const questionAnalyticsRelations = relations(
  questionAnalytics,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionAnalytics.questionId],
      references: [questions.id],
    }),
    form: one(forms, {
      fields: [questionAnalytics.formId],
      references: [forms.id],
    }),
  })
);

export const answerDistributionRelations = relations(
  answerDistribution,
  ({ one }) => ({
    question: one(questions, {
      fields: [answerDistribution.questionId],
      references: [questions.id],
    }),
    form: one(forms, {
      fields: [answerDistribution.formId],
      references: [forms.id],
    }),
  })
);

export const formViewEventsRelations = relations(formViewEvents, ({ one }) => ({
  form: one(forms, {
    fields: [formViewEvents.formId],
    references: [forms.id],
  }),
  question: one(questions, {
    fields: [formViewEvents.questionId],
    references: [questions.id],
  }),
}));

export type FormView = typeof formViews.$inferSelect;
export type NewFormView = typeof formViews.$inferInsert;
export type FormStats = typeof formStats.$inferSelect;
export type NewFormStats = typeof formStats.$inferInsert;
export type FormAnalyticsDaily = typeof formAnalyticsDaily.$inferSelect;
export type NewFormAnalyticsDaily = typeof formAnalyticsDaily.$inferInsert;
export type FormDeviceAnalytics = typeof formDeviceAnalytics.$inferSelect;
export type NewFormDeviceAnalytics = typeof formDeviceAnalytics.$inferInsert;
export type FormGeoAnalytics = typeof formGeoAnalytics.$inferSelect;
export type NewFormGeoAnalytics = typeof formGeoAnalytics.$inferInsert;
export type FormSourceAnalytics = typeof formSourceAnalytics.$inferSelect;
export type NewFormSourceAnalytics = typeof formSourceAnalytics.$inferInsert;
export type QuestionAnalytics = typeof questionAnalytics.$inferSelect;
export type NewQuestionAnalytics = typeof questionAnalytics.$inferInsert;
export type AnswerDistribution = typeof answerDistribution.$inferSelect;
export type NewAnswerDistribution = typeof answerDistribution.$inferInsert;
export type FormViewEvent = typeof formViewEvents.$inferSelect;
export type NewFormViewEvent = typeof formViewEvents.$inferInsert;
