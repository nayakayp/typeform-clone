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

// Custom theme type - supports full theme configuration
export interface CustomTheme {
  // Legacy simple fields (for backwards compatibility)
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  fontFamily?: string;
  backgroundImage?: string;

  // Full theme structure
  name?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    mutedForeground?: string;
    accent?: string;
    accentForeground?: string;
    destructive?: string;
    border?: string;
    input?: string;
    ring?: string;
    questionText?: string;
    questionBackground?: string;
    answerText?: string;
    answerBackground?: string;
  };
  background?: {
    type?: "solid" | "gradient" | "image" | "video";
    color?: string;
    gradient?: {
      type?: "linear" | "radial";
      angle?: number;
      stops?: Array<{ color: string; position: number }>;
    };
    image?: {
      url?: string;
      size?: "cover" | "contain" | "auto";
      position?: "center" | "top" | "bottom" | "left" | "right";
      repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
      overlay?: string;
    };
  };
  typography?: {
    fontFamily?: string;
    headingFontFamily?: string;
    fontSize?: "small" | "medium" | "large";
    lineHeight?: "tight" | "normal" | "relaxed";
    fontWeight?: "light" | "normal" | "medium" | "semibold" | "bold";
  };
  layout?: {
    questionAlignment?: "left" | "center" | "right";
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
    padding?: "compact" | "normal" | "spacious";
    contentPosition?: "top" | "center" | "bottom";
  };
  buttons?: {
    variant?: "solid" | "outline" | "ghost";
    radius?: "none" | "sm" | "md" | "lg" | "full";
    size?: "sm" | "md" | "lg";
  };
  progressBar?: {
    type?: "bar" | "dots" | "percentage" | "steps" | "none";
    position?: "top" | "bottom";
    color?: string;
    showPercentage?: boolean;
  };
  branding?: {
    logo?: string;
    logoPosition?:
      | "top-left"
      | "top-center"
      | "top-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right";
    favicon?: string;
    hidePoweredBy?: boolean;
  };
  animations?: {
    transition?: "none" | "fade" | "slide" | "zoom" | "flip";
    speed?: "slow" | "normal" | "fast";
    enableHover?: boolean;
    enableFocus?: boolean;
  };
}

// Forms table
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
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
  // Note: versions relation is defined in versions.ts to avoid circular imports
  webhooks: many(webhooks),
  views: many(formViews),
  stats: one(formStats),
}));

export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;
