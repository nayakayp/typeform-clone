/**
 * Theme Module
 * Centralized exports for the theming system
 */

// Types
export * from "./types";

// Default values
export {
  DEFAULT_THEME,
  DEFAULT_COLORS,
  DEFAULT_BACKGROUND,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_LAYOUT,
  DEFAULT_BUTTONS,
  DEFAULT_PROGRESS_BAR,
  DEFAULT_BRANDING,
  DEFAULT_ANIMATIONS,
  POPULAR_FONTS,
  GRADIENT_PRESETS,
  COLOR_PALETTES,
} from "./defaults";

// Templates
export {
  THEME_TEMPLATES,
  getThemeTemplate,
  getTemplatesByCategory,
  defaultTheme,
  darkTheme,
  minimalTheme,
  vibrantTheme,
  corporateTheme,
  playfulTheme,
  natureTheme,
  oceanTheme,
  sunsetTheme,
} from "./templates";

// Utilities
export {
  // Color utilities
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  lightenColor,
  darkenColor,
  getContrastColor,
  hexToRgba,
  // Gradient utilities
  gradientToCSS,
  backgroundToCSS,
  // CSS variable utilities
  applyColorsToElement,
  applyThemeToElement,
  removeThemeFromElement,
  // Font loading utilities
  loadGoogleFont,
  loadGoogleFonts,
  preloadThemeFonts,
  // Validation utilities
  isValidHexColor,
  isValidUrl,
  mergeThemes,
  // Serialization utilities
  serializeTheme,
  deserializeTheme,
  generateThemeId,
} from "./utils";
