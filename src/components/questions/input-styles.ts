/**
 * Input style utilities for question renderers
 * Provides consistent styling based on theme inputStyle setting
 */

import type { InputStyle } from "@/lib/theme/types";

/**
 * Get CSS classes for input based on inputStyle
 * @param inputStyle - The input style from theme ("box" | "underline" | "borderless")
 * @param hasError - Whether the input has an error
 * @returns CSS class string
 */
export function getInputStyleClasses(
  inputStyle: InputStyle = "underline",
  hasError?: boolean
): string {
  // Match title font size: text-2xl sm:text-3xl (use ! to override base Input styles)
  const baseClasses = "!text-2xl sm:!text-3xl transition-all duration-200";
  const errorClasses = hasError
    ? "border-destructive focus-visible:ring-destructive"
    : "";

  switch (inputStyle) {
    case "underline":
      return `${baseClasses} border-0 border-b-2 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary hover:border-muted-foreground ${errorClasses}`;
    case "borderless":
      return `${baseClasses} border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 ${errorClasses}`;
    case "box":
    default:
      return `${baseClasses} ${errorClasses}`;
  }
}

/**
 * Get CSS classes for textarea based on inputStyle
 * @param inputStyle - The input style from theme
 * @param hasError - Whether the input has an error
 * @returns CSS class string
 */
export function getTextareaStyleClasses(
  inputStyle: InputStyle = "underline",
  hasError?: boolean
): string {
  // Match title font size: text-2xl sm:text-3xl (use ! to override base Textarea styles)
  const baseClasses = "!text-2xl sm:!text-3xl transition-all duration-200";
  const errorClasses = hasError
    ? "border-destructive focus-visible:ring-destructive"
    : "";

  switch (inputStyle) {
    case "underline":
      return `${baseClasses} border-0 border-b-2 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary hover:border-muted-foreground ${errorClasses}`;
    case "borderless":
      return `${baseClasses} border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 ${errorClasses}`;
    case "box":
    default:
      return `${baseClasses} ${errorClasses}`;
  }
}
