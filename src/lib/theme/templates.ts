/**
 * Pre-built Theme Templates
 * All themes share the same effects/animations - only colors and fonts differ
 */

import type { ThemeTemplate } from "./types";
import {
  DEFAULT_TYPOGRAPHY,
  DEFAULT_LAYOUT,
  DEFAULT_BUTTONS,
  DEFAULT_FORM_ELEMENTS,
  DEFAULT_PROGRESS_BAR,
  DEFAULT_BRANDING,
  DEFAULT_ANIMATIONS,
} from "./defaults";

// Shared configuration for all themes (effects, animations, layout)
const SHARED_CONFIG = {
  layout: DEFAULT_LAYOUT,
  buttons: DEFAULT_BUTTONS,
  formElements: DEFAULT_FORM_ELEMENTS,
  progressBar: DEFAULT_PROGRESS_BAR,
  branding: DEFAULT_BRANDING,
  animations: DEFAULT_ANIMATIONS,
};

// Helper to create theme with shared config
function createTheme(
  colors: ThemeTemplate["theme"]["colors"],
  background: ThemeTemplate["theme"]["background"],
  typography: ThemeTemplate["theme"]["typography"],
  progressBarColor?: string
): ThemeTemplate["theme"] {
  return {
    colors,
    background,
    typography,
    ...SHARED_CONFIG,
    progressBar: {
      ...DEFAULT_PROGRESS_BAR,
      color: progressBarColor || colors.primary,
    },
  };
}

// Default (Clean Blue) Theme
export const defaultTheme: ThemeTemplate = {
  id: "default",
  name: "Default",
  description: "Clean and professional blue theme",
  theme: createTheme(
    {
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
    {
      type: "solid",
      color: "#FFFFFF",
    },
    DEFAULT_TYPOGRAPHY
  ),
};

// Typeform Classic - Matches Typeform's signature style
export const typeformClassicTheme: ThemeTemplate = {
  id: "typeform-classic",
  name: "Typeform Classic",
  description: "Classic Typeform style with underline inputs and badge numbers",
  theme: createTheme(
    {
      primary: "#3B5998",
      secondary: "#6B7280",
      background: "#FFFFFF",
      foreground: "#1F2937",
      muted: "#F3F4F6",
      mutedForeground: "#6B7280",
      accent: "#E8F0FE",
      accentForeground: "#3B5998",
      destructive: "#EF4444",
      border: "#3B5998",
      input: "#3B5998",
      ring: "#3B5998",
      questionText: "#1F2937",
      questionBackground: "transparent",
      answerText: "#1F2937",
      answerBackground: "#FFFFFF",
    },
    {
      type: "solid",
      color: "#FFFFFF",
    },
    {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: "Inter",
      headingFontFamily: "Inter",
      fontSize: "large",
    }
  ),
};

// Dark Mode Theme
export const darkTheme: ThemeTemplate = {
  id: "dark",
  name: "Dark Mode",
  description: "Modern dark theme for low-light environments",
  theme: createTheme(
    {
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
    {
      type: "solid",
      color: "#111827",
    },
    {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: "Inter",
    }
  ),
};

// Minimal Theme
export const minimalTheme: ThemeTemplate = {
  id: "minimal",
  name: "Minimal",
  description: "Clean black and white minimalist design",
  theme: createTheme(
    {
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
    {
      type: "solid",
      color: "#FFFFFF",
    },
    {
      fontFamily: "Inter",
      headingFontFamily: "Inter",
      fontSize: "medium",
      lineHeight: "relaxed",
      fontWeight: "light",
    }
  ),
};

// Vibrant Theme
export const vibrantTheme: ThemeTemplate = {
  id: "vibrant",
  name: "Vibrant",
  description: "Bold and colorful design that stands out",
  theme: createTheme(
    {
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
    {
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
    {
      fontFamily: "Poppins",
      headingFontFamily: "Poppins",
      fontSize: "large",
      lineHeight: "normal",
      fontWeight: "medium",
    }
  ),
};

// Corporate Theme
export const corporateTheme: ThemeTemplate = {
  id: "corporate",
  name: "Corporate",
  description: "Professional theme for business forms",
  theme: createTheme(
    {
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
    {
      type: "solid",
      color: "#F8FAFC",
    },
    {
      fontFamily: "Source Sans Pro",
      headingFontFamily: "Source Sans Pro",
      fontSize: "medium",
      lineHeight: "normal",
      fontWeight: "normal",
    }
  ),
};

// Playful Theme
export const playfulTheme: ThemeTemplate = {
  id: "playful",
  name: "Playful",
  description: "Fun and friendly design with rounded elements",
  theme: createTheme(
    {
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
    {
      type: "solid",
      color: "#FFFBEB",
    },
    {
      fontFamily: "Nunito",
      headingFontFamily: "Nunito",
      fontSize: "large",
      lineHeight: "relaxed",
      fontWeight: "semibold",
    }
  ),
};

// Nature Theme
export const natureTheme: ThemeTemplate = {
  id: "nature",
  name: "Nature",
  description: "Earthy green tones inspired by nature",
  theme: createTheme(
    {
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
    {
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
    {
      fontFamily: "Lato",
      headingFontFamily: "Lato",
      fontSize: "medium",
      lineHeight: "relaxed",
      fontWeight: "normal",
    }
  ),
};

// Ocean Theme
export const oceanTheme: ThemeTemplate = {
  id: "ocean",
  name: "Ocean",
  description: "Calming blue tones inspired by the sea",
  theme: createTheme(
    {
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
    {
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
    {
      fontFamily: "Open Sans",
      headingFontFamily: "Open Sans",
      fontSize: "medium",
      lineHeight: "normal",
      fontWeight: "normal",
    }
  ),
};

// Sunset Theme
export const sunsetTheme: ThemeTemplate = {
  id: "sunset",
  name: "Sunset",
  description: "Warm colors inspired by sunset skies",
  theme: createTheme(
    {
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
    {
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
    {
      fontFamily: "Raleway",
      headingFontFamily: "Raleway",
      fontSize: "large",
      lineHeight: "normal",
      fontWeight: "medium",
    }
  ),
};

// Plain Blue Theme (Teal accent)
export const plainBlueTheme: ThemeTemplate = {
  id: "plain-blue",
  name: "Plain Blue",
  description: "Clean and simple with teal accents",
  theme: createTheme(
    {
      primary: "#14B8A6",
      secondary: "#6B7280",
      background: "#FFFFFF",
      foreground: "#1F2937",
      muted: "#F3F4F6",
      mutedForeground: "#6B7280",
      accent: "#CCFBF1",
      accentForeground: "#0D9488",
      destructive: "#EF4444",
      border: "#E5E7EB",
      input: "#E5E7EB",
      ring: "#14B8A6",
      questionText: "#1F2937",
      questionBackground: "transparent",
      answerText: "#14B8A6",
      answerBackground: "#FFFFFF",
    },
    {
      type: "solid",
      color: "#FFFFFF",
    },
    DEFAULT_TYPOGRAPHY
  ),
};

// Plain Dark Theme
export const plainDarkTheme: ThemeTemplate = {
  id: "plain-dark",
  name: "Plain Dark",
  description: "Simple dark theme with subtle styling",
  theme: createTheme(
    {
      primary: "#374151",
      secondary: "#6B7280",
      background: "#F9FAFB",
      foreground: "#1F2937",
      muted: "#F3F4F6",
      mutedForeground: "#6B7280",
      accent: "#E5E7EB",
      accentForeground: "#1F2937",
      destructive: "#EF4444",
      border: "#E5E7EB",
      input: "#E5E7EB",
      ring: "#374151",
      questionText: "#1F2937",
      questionBackground: "transparent",
      answerText: "#6B7280",
      answerBackground: "#FFFFFF",
    },
    {
      type: "solid",
      color: "#F9FAFB",
    },
    DEFAULT_TYPOGRAPHY
  ),
};

// Barceloneta Theme (Abstract waves pattern)
export const barcelonetaTheme: ThemeTemplate = {
  id: "barceloneta",
  name: "Barceloneta",
  description: "Warm sandy tones with abstract wave patterns",
  theme: createTheme(
    {
      primary: "#374151",
      secondary: "#D4A574",
      background: "#F5F0E8",
      foreground: "#1F2937",
      muted: "#E8E0D4",
      mutedForeground: "#6B7280",
      accent: "#D4A574",
      accentForeground: "#1F2937",
      destructive: "#EF4444",
      border: "#D4A574",
      input: "#E8E0D4",
      ring: "#D4A574",
      questionText: "#1F2937",
      questionBackground: "transparent",
      answerText: "#374151",
      answerBackground: "#FFFFFF",
    },
    {
      type: "solid",
      color: "#F5F0E8",
    },
    {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: "Raleway",
      headingFontFamily: "Raleway",
    },
    "#D4A574"
  ),
};

// Coral Waves Theme
export const coralWavesTheme: ThemeTemplate = {
  id: "coral-waves",
  name: "Coral Waves",
  description: "Soft coral and pink gradient waves",
  theme: createTheme(
    {
      primary: "#374151",
      secondary: "#F87171",
      background: "#FEF2F2",
      foreground: "#1F2937",
      muted: "#FECACA",
      mutedForeground: "#6B7280",
      accent: "#F87171",
      accentForeground: "#1F2937",
      destructive: "#DC2626",
      border: "#FECACA",
      input: "#FEE2E2",
      ring: "#F87171",
      questionText: "#1F2937",
      questionBackground: "transparent",
      answerText: "#374151",
      answerBackground: "#FFFFFF",
    },
    {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 180,
        stops: [
          { color: "#FEF2F2", position: 0 },
          { color: "#FEE2E2", position: 100 },
        ],
      },
    },
    {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: "Outfit",
      headingFontFamily: "Outfit",
    },
    "#F87171"
  ),
};

// Teal Lagoon Theme
export const tealLagoonTheme: ThemeTemplate = {
  id: "teal-lagoon",
  name: "Teal Lagoon",
  description: "Calming teal and seafoam gradients",
  theme: createTheme(
    {
      primary: "#374151",
      secondary: "#5EEAD4",
      background: "#F0FDFA",
      foreground: "#1F2937",
      muted: "#CCFBF1",
      mutedForeground: "#6B7280",
      accent: "#5EEAD4",
      accentForeground: "#1F2937",
      destructive: "#EF4444",
      border: "#99F6E4",
      input: "#CCFBF1",
      ring: "#5EEAD4",
      questionText: "#1F2937",
      questionBackground: "transparent",
      answerText: "#374151",
      answerBackground: "#FFFFFF",
    },
    {
      type: "gradient",
      gradient: {
        type: "linear",
        angle: 180,
        stops: [
          { color: "#F0FDFA", position: 0 },
          { color: "#CCFBF1", position: 100 },
        ],
      },
    },
    {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: "DM Sans",
      headingFontFamily: "DM Sans",
    },
    "#5EEAD4"
  ),
};

// All templates array
export const THEME_TEMPLATES: ThemeTemplate[] = [
  typeformClassicTheme,
  defaultTheme,
  plainBlueTheme,
  plainDarkTheme,
  barcelonetaTheme,
  coralWavesTheme,
  tealLagoonTheme,
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
