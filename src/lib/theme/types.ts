/**
 * Theme Types for the Form Builder
 * Defines the complete theme configuration structure
 */

// Color configuration
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  // Question-specific colors
  questionText: string;
  questionBackground: string;
  answerText: string;
  answerBackground: string;
}

// Background types
export type BackgroundType = "solid" | "gradient" | "image" | "video";

// Gradient configuration
export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientConfig {
  type: "linear" | "radial";
  angle: number; // 0-360 for linear gradients
  stops: GradientStop[];
}

// Background configuration
export interface ThemeBackground {
  type: BackgroundType;
  color?: string;
  gradient?: GradientConfig;
  image?: {
    url: string;
    size: "cover" | "contain" | "auto";
    position: "center" | "top" | "bottom" | "left" | "right";
    repeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
    overlay?: string; // Overlay color with opacity
  };
  video?: {
    url: string;
    overlay?: string;
    loop: boolean;
    muted: boolean;
  };
}

// Typography configuration
export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  fontSize: "small" | "medium" | "large";
  lineHeight: "tight" | "normal" | "relaxed";
  fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
}

// Layout configuration
export interface ThemeLayout {
  questionAlignment: "left" | "center" | "right";
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
  padding: "compact" | "normal" | "spacious";
  contentPosition: "top" | "center" | "bottom";
}

// Button configuration
export interface ThemeButtons {
  variant: "solid" | "outline" | "ghost";
  radius: "none" | "sm" | "md" | "lg" | "full";
  size: "sm" | "md" | "lg";
}

// Progress bar configuration
export type ProgressBarType = "bar" | "dots" | "percentage" | "steps" | "none";
export type ProgressBarPosition = "top" | "bottom";

export interface ThemeProgressBar {
  type: ProgressBarType;
  position: ProgressBarPosition;
  color?: string;
  showPercentage: boolean;
}

// Branding configuration
export type LogoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ThemeBranding {
  logo?: string;
  logoPosition: LogoPosition;
  favicon?: string;
  hidePoweredBy: boolean;
}

// Animation configuration
export type AnimationTransition = "none" | "fade" | "slide" | "zoom" | "flip";
export type AnimationSpeed = "slow" | "normal" | "fast";

export interface ThemeAnimations {
  transition: AnimationTransition;
  speed: AnimationSpeed;
  enableHover: boolean;
  enableFocus: boolean;
}

// Complete theme configuration
export interface Theme {
  id?: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  isPublic?: boolean;

  colors: ThemeColors;
  background: ThemeBackground;
  typography: ThemeTypography;
  layout: ThemeLayout;
  buttons: ThemeButtons;
  progressBar: ThemeProgressBar;
  branding: ThemeBranding;
  animations: ThemeAnimations;

  // Custom CSS for advanced users
  customCSS?: string;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// Theme template (pre-built themes)
export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  theme: Omit<Theme, "id" | "name" | "createdAt" | "updatedAt">;
}

// Partial theme for updates
export type ThemeUpdate = Partial<Theme>;

// Theme preset categories
export type ThemeCategory =
  | "default"
  | "dark"
  | "minimal"
  | "vibrant"
  | "corporate"
  | "playful"
  | "nature"
  | "custom";

// Google Fonts data
export interface GoogleFont {
  family: string;
  variants: string[];
  category: "serif" | "sans-serif" | "display" | "handwriting" | "monospace";
}

// Font sizes mapping
export const FONT_SIZE_MAP = {
  small: {
    base: "14px",
    heading: "24px",
    subheading: "18px",
  },
  medium: {
    base: "16px",
    heading: "32px",
    subheading: "20px",
  },
  large: {
    base: "18px",
    heading: "40px",
    subheading: "24px",
  },
} as const;

// Line height mapping
export const LINE_HEIGHT_MAP = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Max width mapping
export const MAX_WIDTH_MAP = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  full: "100%",
} as const;

// Padding mapping
export const PADDING_MAP = {
  compact: {
    x: "16px",
    y: "24px",
  },
  normal: {
    x: "32px",
    y: "48px",
  },
  spacious: {
    x: "64px",
    y: "80px",
  },
} as const;

// Border radius mapping
export const RADIUS_MAP = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
} as const;

// Animation speed mapping (in ms)
export const ANIMATION_SPEED_MAP = {
  slow: 500,
  normal: 300,
  fast: 150,
} as const;
