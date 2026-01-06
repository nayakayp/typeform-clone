import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "./workspaces";
import { forms } from "./forms";

// Background gradient type
export interface BackgroundGradient {
  type: "linear" | "radial";
  angle?: number;
  colors: string[];
}

// Themes table
export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),

  // Colors
  primaryColor: varchar("primary_color", { length: 7 }).default("#0066FF"),
  backgroundColor: varchar("background_color", { length: 7 }).default(
    "#FFFFFF"
  ),
  textColor: varchar("text_color", { length: 7 }).default("#000000"),
  buttonColor: varchar("button_color", { length: 7 }),
  buttonTextColor: varchar("button_text_color", { length: 7 }),

  // Background
  backgroundType: varchar("background_type", { length: 20 }).default("solid"), // solid, gradient, image, video
  backgroundImage: text("background_image"),
  backgroundVideo: text("background_video"),
  backgroundGradient: jsonb("background_gradient").$type<BackgroundGradient>(),

  // Typography
  fontFamily: varchar("font_family", { length: 100 }).default("Inter"),
  fontSize: varchar("font_size", { length: 20 }).default("medium"),

  // Branding
  logo: text("logo"),
  logoPosition: varchar("logo_position", { length: 20 }).default("top-left"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Theme relations
export const themesRelations = relations(themes, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [themes.workspaceId],
    references: [workspaces.id],
  }),
  forms: many(forms),
}));

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
