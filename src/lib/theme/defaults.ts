/**
 * Default Theme Configuration
 * These values are used when no theme is specified
 */

import type {
  Theme,
  ThemeColors,
  ThemeBackground,
  ThemeTypography,
  ThemeLayout,
  ThemeButtons,
  ThemeFormElements,
  ThemeProgressBar,
  ThemeBranding,
  ThemeAnimations,
} from "./types";

// Default colors (Clean blue theme)
export const DEFAULT_COLORS: ThemeColors = {
  primary: "#0066FF",
  secondary: "#6B7280",
  background: "#FFFFFF",
  foreground: "#1F2937",
  muted: "#F3F4F6",
  mutedForeground: "#6B7280",
  accent: "#E0E7FF",
  accentForeground: "#3730A3",
  destructive: "#EF4444",
  border: "#E5E7EB",
  input: "#E5E7EB",
  ring: "#0066FF",
  questionText: "#1F2937",
  questionBackground: "transparent",
  answerText: "#374151",
  answerBackground: "#FFFFFF",
};

// Default background
export const DEFAULT_BACKGROUND: ThemeBackground = {
  type: "solid",
  color: "#FFFFFF",
};

// Default typography
export const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  fontFamily: "Inter",
  headingFontFamily: "Inter",
  fontSize: "medium",
  lineHeight: "normal",
  fontWeight: "normal",
};

// Default layout
export const DEFAULT_LAYOUT: ThemeLayout = {
  questionAlignment: "left",
  maxWidth: "lg",
  padding: "normal",
  contentPosition: "center",
};

// Default buttons
export const DEFAULT_BUTTONS: ThemeButtons = {
  variant: "solid",
  radius: "md",
  size: "md",
  submitText: "OK",
};

// Default form elements
export const DEFAULT_FORM_ELEMENTS: ThemeFormElements = {
  inputStyle: "underline",
  questionNumberStyle: "badge",
  navigationStyle: "corner-arrows",
};

// Default progress bar
export const DEFAULT_PROGRESS_BAR: ThemeProgressBar = {
  type: "bar",
  position: "top",
  showPercentage: true,
};

// Default branding
export const DEFAULT_BRANDING: ThemeBranding = {
  logoPosition: "top-left",
  hidePoweredBy: false,
};

// Default animations
export const DEFAULT_ANIMATIONS: ThemeAnimations = {
  transition: "slide",
  speed: "normal",
  enableHover: true,
  enableFocus: true,
};

// Complete default theme
export const DEFAULT_THEME: Theme = {
  name: "Default",
  description: "Clean and professional default theme",
  isDefault: true,
  isPublic: true,

  colors: DEFAULT_COLORS,
  background: DEFAULT_BACKGROUND,
  typography: DEFAULT_TYPOGRAPHY,
  layout: DEFAULT_LAYOUT,
  buttons: DEFAULT_BUTTONS,
  formElements: DEFAULT_FORM_ELEMENTS,
  progressBar: DEFAULT_PROGRESS_BAR,
  branding: DEFAULT_BRANDING,
  animations: DEFAULT_ANIMATIONS,
};

// Popular Google Fonts for forms
export const POPULAR_FONTS = [
  { family: "Inter", category: "sans-serif" },
  { family: "Roboto", category: "sans-serif" },
  { family: "Open Sans", category: "sans-serif" },
  { family: "Lato", category: "sans-serif" },
  { family: "Poppins", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Source Sans Pro", category: "sans-serif" },
  { family: "Nunito", category: "sans-serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Work Sans", category: "sans-serif" },
  { family: "DM Sans", category: "sans-serif" },
  { family: "Manrope", category: "sans-serif" },
  { family: "Plus Jakarta Sans", category: "sans-serif" },
  { family: "Space Grotesk", category: "sans-serif" },
  { family: "Outfit", category: "sans-serif" },
  { family: "Playfair Display", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "Georgia", category: "serif" },
  { family: "Crimson Text", category: "serif" },
  { family: "Fira Code", category: "monospace" },
  { family: "JetBrains Mono", category: "monospace" },
  { family: "Pacifico", category: "handwriting" },
  { family: "Dancing Script", category: "handwriting" },
] as const;

// Default gradient presets
export const GRADIENT_PRESETS = [
  {
    name: "Ocean Blue",
    gradient: {
      type: "linear" as const,
      angle: 135,
      stops: [
        { color: "#667eea", position: 0 },
        { color: "#764ba2", position: 100 },
      ],
    },
  },
  {
    name: "Sunset",
    gradient: {
      type: "linear" as const,
      angle: 90,
      stops: [
        { color: "#f093fb", position: 0 },
        { color: "#f5576c", position: 100 },
      ],
    },
  },
  {
    name: "Fresh Grass",
    gradient: {
      type: "linear" as const,
      angle: 180,
      stops: [
        { color: "#11998e", position: 0 },
        { color: "#38ef7d", position: 100 },
      ],
    },
  },
  {
    name: "Warm Flame",
    gradient: {
      type: "linear" as const,
      angle: 45,
      stops: [
        { color: "#ff9a9e", position: 0 },
        { color: "#fecfef", position: 100 },
      ],
    },
  },
  {
    name: "Night Sky",
    gradient: {
      type: "linear" as const,
      angle: 180,
      stops: [
        { color: "#0f0c29", position: 0 },
        { color: "#302b63", position: 50 },
        { color: "#24243e", position: 100 },
      ],
    },
  },
  {
    name: "Peach",
    gradient: {
      type: "radial" as const,
      angle: 0,
      stops: [
        { color: "#ffecd2", position: 0 },
        { color: "#fcb69f", position: 100 },
      ],
    },
  },
  {
    name: "Purple Haze",
    gradient: {
      type: "linear" as const,
      angle: 120,
      stops: [
        { color: "#7028e4", position: 0 },
        { color: "#e5b2ca", position: 100 },
      ],
    },
  },
  {
    name: "Arctic",
    gradient: {
      type: "linear" as const,
      angle: 90,
      stops: [
        { color: "#74ebd5", position: 0 },
        { color: "#9face6", position: 100 },
      ],
    },
  },
];

// Color palette presets
export const COLOR_PALETTES = {
  blue: {
    primary: "#0066FF",
    secondary: "#6B7280",
    accent: "#E0E7FF",
  },
  purple: {
    primary: "#7C3AED",
    secondary: "#6B7280",
    accent: "#EDE9FE",
  },
  green: {
    primary: "#059669",
    secondary: "#6B7280",
    accent: "#D1FAE5",
  },
  red: {
    primary: "#DC2626",
    secondary: "#6B7280",
    accent: "#FEE2E2",
  },
  orange: {
    primary: "#EA580C",
    secondary: "#6B7280",
    accent: "#FFEDD5",
  },
  pink: {
    primary: "#DB2777",
    secondary: "#6B7280",
    accent: "#FCE7F3",
  },
  teal: {
    primary: "#0D9488",
    secondary: "#6B7280",
    accent: "#CCFBF1",
  },
  indigo: {
    primary: "#4F46E5",
    secondary: "#6B7280",
    accent: "#E0E7FF",
  },
};
