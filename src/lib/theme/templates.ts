/**
 * Pre-built Theme Templates
 * These templates provide quick starting points for form styling
 */

import type { ThemeTemplate } from "./types";
import {
  DEFAULT_TYPOGRAPHY,
  DEFAULT_LAYOUT,
  DEFAULT_BUTTONS,
  DEFAULT_PROGRESS_BAR,
  DEFAULT_BRANDING,
  DEFAULT_ANIMATIONS,
} from "./defaults";

// Default (Clean Blue) Theme
export const defaultTheme: ThemeTemplate = {
  id: "default",
  name: "Default",
  description: "Clean and professional blue theme",
  theme: {
    colors: {
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
    },
    background: {
      type: "solid",
      color: "#FFFFFF",
    },
    typography: DEFAULT_TYPOGRAPHY,
    layout: DEFAULT_LAYOUT,
    buttons: DEFAULT_BUTTONS,
    progressBar: DEFAULT_PROGRESS_BAR,
    branding: DEFAULT_BRANDING,
    animations: DEFAULT_ANIMATIONS,
  },
};

// Dark Mode Theme
export const darkTheme: ThemeTemplate = {
  id: "dark",
  name: "Dark Mode",
  description: "Modern dark theme for low-light environments",
  theme: {
    colors: {
      primary: "#3B82F6",
      secondary: "#9CA3AF",
      background: "#111827",
      foreground: "#F9FAFB",
      muted: "#1F2937",
      mutedForeground: "#9CA3AF",
      accent: "#1E3A5F",
      accentForeground: "#93C5FD",
      destructive: "#F87171",
      border: "#374151",
      input: "#374151",
      ring: "#3B82F6",
      questionText: "#F9FAFB",
      questionBackground: "transparent",
      answerText: "#E5E7EB",
      answerBackground: "#1F2937",
    },
    background: {
      type: "solid",
      color: "#111827",
    },
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: "Inter",
    },
    layout: DEFAULT_LAYOUT,
    buttons: {
      ...DEFAULT_BUTTONS,
      variant: "solid",
    },
    progressBar: {
      ...DEFAULT_PROGRESS_BAR,
      color: "#3B82F6",
    },
    branding: DEFAULT_BRANDING,
    animations: DEFAULT_ANIMATIONS,
  },
};

// Minimal Theme
export const minimalTheme: ThemeTemplate = {
  id: "minimal",
  name: "Minimal",
  description: "Clean black and white minimalist design",
  theme: {
    colors: {
      primary: "#000000",
      secondary: "#737373",
      background: "#FFFFFF",
      foreground: "#000000",
      muted: "#F5F5F5",
      mutedForeground: "#737373",
      accent: "#E5E5E5",
      accentForeground: "#262626",
      destructive: "#DC2626",
      border: "#E5E5E5",
      input: "#E5E5E5",
      ring: "#000000",
      questionText: "#000000",
      questionBackground: "transparent",
      answerText: "#262626",
      answerBackground: "#FFFFFF",
    },
    background: {
      type: "solid",
      color: "#FFFFFF",
    },
    typography: {
      fontFamily: "Inter",
      headingFontFamily: "Inter",
      fontSize: "medium",
      lineHeight: "relaxed",
      fontWeight: "light",
    },
    layout: {
      ...DEFAULT_LAYOUT,
      questionAlignment: "left",
      padding: "spacious",
    },
    buttons: {
      variant: "outline",
      radius: "none",
      size: "md",
    },
    progressBar: {
      type: "bar",
      position: "top",
      showPercentage: false,
      color: "#000000",
    },
    branding: DEFAULT_BRANDING,
    animations: {
      transition: "fade",
      speed: "slow",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// Vibrant Theme
export const vibrantTheme: ThemeTemplate = {
  id: "vibrant",
  name: "Vibrant",
  description: "Bold and colorful design that stands out",
  theme: {
    colors: {
      primary: "#8B5CF6",
      secondary: "#EC4899",
      background: "#FDFBFF",
      foreground: "#1E1B4B",
      muted: "#F5F3FF",
      mutedForeground: "#7C3AED",
      accent: "#FDE68A",
      accentForeground: "#92400E",
      destructive: "#F43F5E",
      border: "#DDD6FE",
      input: "#DDD6FE",
      ring: "#8B5CF6",
      questionText: "#1E1B4B",
      questionBackground: "transparent",
      answerText: "#4C1D95",
      answerBackground: "#F5F3FF",
    },
    background: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#FDFBFF", position: 0 },
          { color: "#FDF4FF", position: 50 },
          { color: "#FEF3F2", position: 100 },
        ],
      },
    },
    typography: {
      fontFamily: "Poppins",
      headingFontFamily: "Poppins",
      fontSize: "large",
      lineHeight: "normal",
      fontWeight: "medium",
    },
    layout: {
      ...DEFAULT_LAYOUT,
      questionAlignment: "center",
    },
    buttons: {
      variant: "solid",
      radius: "full",
      size: "lg",
    },
    progressBar: {
      type: "dots",
      position: "bottom",
      showPercentage: false,
      color: "#8B5CF6",
    },
    branding: DEFAULT_BRANDING,
    animations: {
      transition: "zoom",
      speed: "fast",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// Corporate Theme
export const corporateTheme: ThemeTemplate = {
  id: "corporate",
  name: "Corporate",
  description: "Professional theme for business forms",
  theme: {
    colors: {
      primary: "#1E40AF",
      secondary: "#64748B",
      background: "#F8FAFC",
      foreground: "#0F172A",
      muted: "#F1F5F9",
      mutedForeground: "#64748B",
      accent: "#DBEAFE",
      accentForeground: "#1E40AF",
      destructive: "#DC2626",
      border: "#CBD5E1",
      input: "#CBD5E1",
      ring: "#1E40AF",
      questionText: "#0F172A",
      questionBackground: "#FFFFFF",
      answerText: "#1E293B",
      answerBackground: "#FFFFFF",
    },
    background: {
      type: "solid",
      color: "#F8FAFC",
    },
    typography: {
      fontFamily: "Source Sans Pro",
      headingFontFamily: "Source Sans Pro",
      fontSize: "medium",
      lineHeight: "normal",
      fontWeight: "normal",
    },
    layout: {
      questionAlignment: "left",
      maxWidth: "md",
      padding: "normal",
      contentPosition: "center",
    },
    buttons: {
      variant: "solid",
      radius: "sm",
      size: "md",
    },
    progressBar: {
      type: "percentage",
      position: "top",
      showPercentage: true,
      color: "#1E40AF",
    },
    branding: {
      logoPosition: "top-left",
      hidePoweredBy: false,
    },
    animations: {
      transition: "slide",
      speed: "normal",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// Playful Theme
export const playfulTheme: ThemeTemplate = {
  id: "playful",
  name: "Playful",
  description: "Fun and friendly design with rounded elements",
  theme: {
    colors: {
      primary: "#F97316",
      secondary: "#84CC16",
      background: "#FFFBEB",
      foreground: "#422006",
      muted: "#FEF3C7",
      mutedForeground: "#A16207",
      accent: "#BBF7D0",
      accentForeground: "#166534",
      destructive: "#EF4444",
      border: "#FCD34D",
      input: "#FEF3C7",
      ring: "#F97316",
      questionText: "#422006",
      questionBackground: "transparent",
      answerText: "#713F12",
      answerBackground: "#FFFFFF",
    },
    background: {
      type: "solid",
      color: "#FFFBEB",
    },
    typography: {
      fontFamily: "Nunito",
      headingFontFamily: "Nunito",
      fontSize: "large",
      lineHeight: "relaxed",
      fontWeight: "semibold",
    },
    layout: {
      questionAlignment: "center",
      maxWidth: "lg",
      padding: "spacious",
      contentPosition: "center",
    },
    buttons: {
      variant: "solid",
      radius: "full",
      size: "lg",
    },
    progressBar: {
      type: "steps",
      position: "top",
      showPercentage: false,
      color: "#F97316",
    },
    branding: DEFAULT_BRANDING,
    animations: {
      transition: "zoom",
      speed: "fast",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// Nature Theme
export const natureTheme: ThemeTemplate = {
  id: "nature",
  name: "Nature",
  description: "Earthy green tones inspired by nature",
  theme: {
    colors: {
      primary: "#059669",
      secondary: "#84CC16",
      background: "#F0FDF4",
      foreground: "#14532D",
      muted: "#DCFCE7",
      mutedForeground: "#166534",
      accent: "#BBF7D0",
      accentForeground: "#14532D",
      destructive: "#DC2626",
      border: "#86EFAC",
      input: "#DCFCE7",
      ring: "#059669",
      questionText: "#14532D",
      questionBackground: "transparent",
      answerText: "#166534",
      answerBackground: "#FFFFFF",
    },
    background: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 180,
        stops: [
          { color: "#F0FDF4", position: 0 },
          { color: "#ECFDF5", position: 100 },
        ],
      },
    },
    typography: {
      fontFamily: "Lato",
      headingFontFamily: "Lato",
      fontSize: "medium",
      lineHeight: "relaxed",
      fontWeight: "normal",
    },
    layout: {
      questionAlignment: "left",
      maxWidth: "lg",
      padding: "spacious",
      contentPosition: "center",
    },
    buttons: {
      variant: "solid",
      radius: "lg",
      size: "md",
    },
    progressBar: {
      type: "bar",
      position: "top",
      showPercentage: true,
      color: "#059669",
    },
    branding: DEFAULT_BRANDING,
    animations: {
      transition: "fade",
      speed: "slow",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// Ocean Theme
export const oceanTheme: ThemeTemplate = {
  id: "ocean",
  name: "Ocean",
  description: "Calming blue tones inspired by the sea",
  theme: {
    colors: {
      primary: "#0891B2",
      secondary: "#06B6D4",
      background: "#ECFEFF",
      foreground: "#164E63",
      muted: "#CFFAFE",
      mutedForeground: "#0E7490",
      accent: "#A5F3FC",
      accentForeground: "#155E75",
      destructive: "#EF4444",
      border: "#67E8F9",
      input: "#CFFAFE",
      ring: "#0891B2",
      questionText: "#164E63",
      questionBackground: "transparent",
      answerText: "#0E7490",
      answerBackground: "#FFFFFF",
    },
    background: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 180,
        stops: [
          { color: "#ECFEFF", position: 0 },
          { color: "#E0F2FE", position: 100 },
        ],
      },
    },
    typography: {
      fontFamily: "Open Sans",
      headingFontFamily: "Open Sans",
      fontSize: "medium",
      lineHeight: "normal",
      fontWeight: "normal",
    },
    layout: {
      questionAlignment: "center",
      maxWidth: "lg",
      padding: "normal",
      contentPosition: "center",
    },
    buttons: {
      variant: "solid",
      radius: "lg",
      size: "md",
    },
    progressBar: {
      type: "bar",
      position: "bottom",
      showPercentage: true,
      color: "#0891B2",
    },
    branding: DEFAULT_BRANDING,
    animations: {
      transition: "slide",
      speed: "normal",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// Sunset Theme
export const sunsetTheme: ThemeTemplate = {
  id: "sunset",
  name: "Sunset",
  description: "Warm colors inspired by sunset skies",
  theme: {
    colors: {
      primary: "#DC2626",
      secondary: "#F97316",
      background: "#FEF2F2",
      foreground: "#450A0A",
      muted: "#FECACA",
      mutedForeground: "#991B1B",
      accent: "#FED7AA",
      accentForeground: "#9A3412",
      destructive: "#B91C1C",
      border: "#FCA5A5",
      input: "#FECACA",
      ring: "#DC2626",
      questionText: "#450A0A",
      questionBackground: "transparent",
      answerText: "#7F1D1D",
      answerBackground: "#FFFFFF",
    },
    background: {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#FEF2F2", position: 0 },
          { color: "#FFF7ED", position: 50 },
          { color: "#FFFBEB", position: 100 },
        ],
      },
    },
    typography: {
      fontFamily: "Raleway",
      headingFontFamily: "Raleway",
      fontSize: "large",
      lineHeight: "normal",
      fontWeight: "medium",
    },
    layout: {
      questionAlignment: "center",
      maxWidth: "lg",
      padding: "spacious",
      contentPosition: "center",
    },
    buttons: {
      variant: "solid",
      radius: "md",
      size: "lg",
    },
    progressBar: {
      type: "dots",
      position: "bottom",
      showPercentage: false,
      color: "#DC2626",
    },
    branding: DEFAULT_BRANDING,
    animations: {
      transition: "fade",
      speed: "normal",
      enableHover: true,
      enableFocus: true,
    },
  },
};

// All templates array
export const THEME_TEMPLATES: ThemeTemplate[] = [
  defaultTheme,
  darkTheme,
  minimalTheme,
  vibrantTheme,
  corporateTheme,
  playfulTheme,
  natureTheme,
  oceanTheme,
  sunsetTheme,
];

// Get template by ID
export function getThemeTemplate(id: string): ThemeTemplate | undefined {
  return THEME_TEMPLATES.find((template) => template.id === id);
}

// Get templates by category
export function getTemplatesByCategory(
  category: "light" | "dark" | "colorful"
): ThemeTemplate[] {
  switch (category) {
    case "light":
      return [defaultTheme, minimalTheme, corporateTheme];
    case "dark":
      return [darkTheme];
    case "colorful":
      return [
        vibrantTheme,
        playfulTheme,
        natureTheme,
        oceanTheme,
        sunsetTheme,
      ];
    default:
      return THEME_TEMPLATES;
  }
}
