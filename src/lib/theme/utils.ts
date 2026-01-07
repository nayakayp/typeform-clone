/**
 * Theme Utilities
 * Helper functions for color conversion, CSS variable application, and font loading
 */

import type {
  Theme,
  ThemeBackground,
  GradientConfig,
  ThemeColors,
} from "./types";
import {
  FONT_SIZE_MAP,
  LINE_HEIGHT_MAP,
  MAX_WIDTH_MAP,
  PADDING_MAP,
  RADIUS_MAP,
  ANIMATION_SPEED_MAP,
} from "./types";

// ============================================
// Color Conversion Utilities
// ============================================

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Convert hex color to HSL values
 */
export function hexToHsl(
  hex: string
): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/**
 * Lighten a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  const newL = Math.min(100, hsl.l + percent);
  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  const newL = Math.max(0, hsl.l - percent);
  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * Get contrasting text color (black or white) for a given background
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Add alpha channel to hex color
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ============================================
// Gradient Utilities
// ============================================

/**
 * Convert gradient config to CSS gradient string
 */
export function gradientToCSS(gradient: GradientConfig): string {
  const stops = gradient.stops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");

  if (gradient.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }

  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

/**
 * Generate background CSS from theme background config
 */
export function backgroundToCSS(background: ThemeBackground): string {
  switch (background.type) {
    case "solid":
      return background.color || "#FFFFFF";

    case "gradient":
      if (background.gradient) {
        return gradientToCSS(background.gradient);
      }
      return background.color || "#FFFFFF";

    case "image":
      if (background.image) {
        const { url, size, position, repeat, overlay } = background.image;
        const overlayCSS = overlay ? `${overlay}, ` : "";
        return `${overlayCSS}url(${url}) ${position} / ${size} ${repeat}`;
      }
      return background.color || "#FFFFFF";

    case "video":
      // Video backgrounds are handled separately in CSS
      return background.video?.overlay || "transparent";

    default:
      return background.color || "#FFFFFF";
  }
}

// ============================================
// CSS Variable Utilities
// ============================================

/**
 * Generate CSS variable name from camelCase key
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Apply theme colors as CSS variables to a target element
 */
export function applyColorsToElement(
  element: HTMLElement,
  colors: ThemeColors
): void {
  Object.entries(colors).forEach(([key, value]) => {
    element.style.setProperty(`--theme-${toKebabCase(key)}`, value);
  });
}

/**
 * Apply complete theme as CSS variables
 */
export function applyThemeToElement(element: HTMLElement, theme: Theme): void {
  // Apply colors
  applyColorsToElement(element, theme.colors);

  // Apply background
  const bgCSS = backgroundToCSS(theme.background);
  element.style.setProperty("--theme-background-css", bgCSS);

  if (theme.background.type === "solid") {
    element.style.background = theme.background.color || "#FFFFFF";
  } else if (
    theme.background.type === "gradient" &&
    theme.background.gradient
  ) {
    element.style.background = gradientToCSS(theme.background.gradient);
  }

  // Apply typography
  const fontSize = FONT_SIZE_MAP[theme.typography.fontSize];
  const lineHeight = LINE_HEIGHT_MAP[theme.typography.lineHeight];

  element.style.setProperty("--theme-font-family", theme.typography.fontFamily);
  element.style.setProperty(
    "--theme-heading-font-family",
    theme.typography.headingFontFamily
  );
  element.style.setProperty("--theme-font-size-base", fontSize.base);
  element.style.setProperty("--theme-font-size-heading", fontSize.heading);
  element.style.setProperty("--theme-font-size-subheading", fontSize.subheading);
  element.style.setProperty("--theme-line-height", String(lineHeight));
  element.style.setProperty("--theme-font-weight", theme.typography.fontWeight);

  // Apply layout
  element.style.setProperty(
    "--theme-max-width",
    MAX_WIDTH_MAP[theme.layout.maxWidth]
  );
  element.style.setProperty(
    "--theme-padding-x",
    PADDING_MAP[theme.layout.padding].x
  );
  element.style.setProperty(
    "--theme-padding-y",
    PADDING_MAP[theme.layout.padding].y
  );
  element.style.setProperty(
    "--theme-question-alignment",
    theme.layout.questionAlignment
  );

  // Apply buttons
  element.style.setProperty(
    "--theme-button-radius",
    RADIUS_MAP[theme.buttons.radius]
  );
  element.style.setProperty("--theme-button-variant", theme.buttons.variant);
  element.style.setProperty("--theme-button-size", theme.buttons.size);

  // Apply progress bar
  if (theme.progressBar.color) {
    element.style.setProperty(
      "--theme-progress-color",
      theme.progressBar.color
    );
  }

  // Apply animations
  element.style.setProperty(
    "--theme-transition-speed",
    `${ANIMATION_SPEED_MAP[theme.animations.speed]}ms`
  );
  element.style.setProperty(
    "--theme-transition-type",
    theme.animations.transition
  );
}

/**
 * Remove theme CSS variables from element
 */
export function removeThemeFromElement(element: HTMLElement): void {
  const style = element.style;
  const properties = Array.from(style);

  properties.forEach((prop) => {
    if (prop.startsWith("--theme-")) {
      style.removeProperty(prop);
    }
  });

  // Clear background
  style.removeProperty("background");
}

// ============================================
// Font Loading Utilities
// ============================================

/**
 * Load a Google Font dynamically
 */
export function loadGoogleFont(fontFamily: string, weights?: string[]): void {
  if (typeof window === "undefined") return;

  // Check if font is already loaded
  const existingLink = document.querySelector(
    `link[data-font="${fontFamily}"]`
  );
  if (existingLink) return;

  // Create link element
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.setAttribute("data-font", fontFamily);

  // Build Google Fonts URL
  const encodedFamily = fontFamily.replace(/\s+/g, "+");
  const weightString = weights?.length
    ? `:wght@${weights.join(";")}`
    : ":wght@300;400;500;600;700";

  link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}${weightString}&display=swap`;

  document.head.appendChild(link);
}

/**
 * Load multiple Google Fonts
 */
export function loadGoogleFonts(fonts: string[]): void {
  fonts.forEach((font) => loadGoogleFont(font));
}

/**
 * Preload Google Fonts from theme
 */
export function preloadThemeFonts(theme: Theme): void {
  const fonts = new Set<string>();
  fonts.add(theme.typography.fontFamily);
  fonts.add(theme.typography.headingFontFamily);

  loadGoogleFonts(Array.from(fonts));
}

// ============================================
// Theme Validation Utilities
// ============================================

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep merge two theme objects
 */
export function mergeThemes(base: Theme, overrides: Partial<Theme>): Theme {
  return {
    ...base,
    ...overrides,
    colors: {
      ...base.colors,
      ...(overrides.colors || {}),
    },
    background: {
      ...base.background,
      ...(overrides.background || {}),
    },
    typography: {
      ...base.typography,
      ...(overrides.typography || {}),
    },
    layout: {
      ...base.layout,
      ...(overrides.layout || {}),
    },
    buttons: {
      ...base.buttons,
      ...(overrides.buttons || {}),
    },
    progressBar: {
      ...base.progressBar,
      ...(overrides.progressBar || {}),
    },
    branding: {
      ...base.branding,
      ...(overrides.branding || {}),
    },
    animations: {
      ...base.animations,
      ...(overrides.animations || {}),
    },
  };
}

// ============================================
// Theme Serialization
// ============================================

/**
 * Serialize theme for storage/API
 */
export function serializeTheme(theme: Theme): string {
  return JSON.stringify(theme);
}

/**
 * Deserialize theme from storage/API
 */
export function deserializeTheme(json: string): Theme | null {
  try {
    return JSON.parse(json) as Theme;
  } catch {
    return null;
  }
}

/**
 * Generate a unique theme ID
 */
export function generateThemeId(): string {
  return `theme_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
