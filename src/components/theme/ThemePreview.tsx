"use client";

/**
 * ThemePreview Component
 * Live preview of theme settings
 */

import { useMemo } from "react";
import { ChevronRight, Star } from "lucide-react";
import type { Theme } from "@/lib/theme/types";
import {
  gradientToCSS,
  FONT_SIZE_MAP,
  LINE_HEIGHT_MAP,
  RADIUS_MAP,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface ThemePreviewProps {
  theme: Theme;
  className?: string;
}

// ============================================
// Main Component
// ============================================

export function ThemePreview({ theme, className }: ThemePreviewProps) {
  // Generate background style
  const backgroundStyle = useMemo(() => {
    switch (theme.background.type) {
      case "solid":
        return { backgroundColor: theme.background.color || "#FFFFFF" };
      case "gradient":
        if (theme.background.gradient) {
          return { background: gradientToCSS(theme.background.gradient) };
        }
        return { backgroundColor: theme.background.color || "#FFFFFF" };
      case "image":
        if (theme.background.image) {
          const { url, size, position, repeat, overlay } = theme.background.image;
          const overlayCSS = overlay
            ? `linear-gradient(${overlay}80, ${overlay}80), `
            : "";
          return {
            background: `${overlayCSS}url(${url}) ${position} / ${size} ${repeat}`,
          };
        }
        return { backgroundColor: theme.background.color || "#FFFFFF" };
      default:
        return { backgroundColor: theme.background.color || "#FFFFFF" };
    }
  }, [theme.background]);

  // Get font sizes
  const fontSize = FONT_SIZE_MAP[theme.typography.fontSize];
  const lineHeight = LINE_HEIGHT_MAP[theme.typography.lineHeight];
  const buttonRadius = RADIUS_MAP[theme.buttons.radius];

  // Get font weight value
  const fontWeightValue =
    theme.typography.fontWeight === "light"
      ? 300
      : theme.typography.fontWeight === "normal"
        ? 400
        : theme.typography.fontWeight === "medium"
          ? 500
          : theme.typography.fontWeight === "semibold"
            ? 600
            : 700;

  // Button styles based on variant
  const getButtonStyles = () => {
    const base = {
      borderRadius: buttonRadius,
      fontFamily: theme.typography.fontFamily,
    };

    switch (theme.buttons.variant) {
      case "solid":
        return {
          ...base,
          backgroundColor: theme.colors.primary,
          color: "#FFFFFF",
          border: "none",
        };
      case "outline":
        return {
          ...base,
          backgroundColor: "transparent",
          color: theme.colors.primary,
          border: `2px solid ${theme.colors.primary}`,
        };
      case "ghost":
        return {
          ...base,
          backgroundColor: "transparent",
          color: theme.colors.primary,
          border: "none",
        };
      default:
        return base;
    }
  };

  // Button size classes
  const buttonPadding =
    theme.buttons.size === "sm"
      ? "6px 12px"
      : theme.buttons.size === "md"
        ? "10px 20px"
        : "14px 28px";

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b p-3">
        <span className="text-sm font-medium">Preview</span>
        <span className="text-xs text-muted-foreground">
          {theme.name || "Custom Theme"}
        </span>
      </div>

      {/* Preview Content */}
      <div
        className="flex-1 overflow-auto"
        style={{
          ...backgroundStyle,
          fontFamily: theme.typography.fontFamily,
          lineHeight,
        }}
      >
        {/* Progress Bar (Top) */}
        {theme.progressBar.type !== "none" &&
          theme.progressBar.position === "top" && (
            <div className="p-2">
              <ProgressBarPreview
                type={theme.progressBar.type}
                color={theme.progressBar.color || theme.colors.primary}
                showPercentage={theme.progressBar.showPercentage}
                progress={35}
              />
            </div>
          )}

        {/* Logo (if configured) */}
        {theme.branding.logo && (
          <div
            className={cn(
              "p-3",
              theme.branding.logoPosition.includes("left") && "text-left",
              theme.branding.logoPosition.includes("center") && "text-center",
              theme.branding.logoPosition.includes("right") && "text-right"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.branding.logo}
              alt="Logo"
              className="inline-block h-8 w-auto"
            />
          </div>
        )}

        {/* Question Preview */}
        <div
          className="p-4"
          style={{
            textAlign: theme.layout.questionAlignment,
          }}
        >
          {/* Question Title */}
          <h2
            style={{
              fontFamily: theme.typography.headingFontFamily,
              fontSize: fontSize.heading,
              color: theme.colors.questionText,
              fontWeight: fontWeightValue,
              marginBottom: "8px",
            }}
          >
            What is your name?
          </h2>

          {/* Question Description */}
          <p
            style={{
              fontFamily: theme.typography.fontFamily,
              fontSize: fontSize.subheading,
              color: theme.colors.mutedForeground,
              marginBottom: "16px",
            }}
          >
            Please enter your full name
          </p>

          {/* Input Preview */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Type your answer here..."
              className="w-full outline-none"
              style={{
                fontFamily: theme.typography.fontFamily,
                fontSize: fontSize.base,
                color: theme.colors.answerText,
                backgroundColor: theme.colors.answerBackground,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: buttonRadius,
                padding: "12px 16px",
              }}
            />
          </div>

          {/* Button Preview */}
          <button
            style={{
              ...getButtonStyles(),
              padding: buttonPadding,
              fontSize: fontSize.base,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Multiple Choice Preview */}
        <div
          className="border-t p-4"
          style={{
            textAlign: theme.layout.questionAlignment,
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.headingFontFamily,
              fontSize: fontSize.subheading,
              color: theme.colors.questionText,
              fontWeight: fontWeightValue,
              marginBottom: "12px",
            }}
          >
            Choose an option
          </h3>

          <div className="space-y-2">
            {["Option A", "Option B", "Option C"].map((option, index) => (
              <div
                key={option}
                className="flex cursor-pointer items-center gap-3 transition-colors"
                style={{
                  backgroundColor:
                    index === 0
                      ? theme.colors.accent
                      : theme.colors.answerBackground,
                  border: `2px solid ${index === 0 ? theme.colors.primary : theme.colors.border}`,
                  borderRadius: buttonRadius,
                  padding: "12px 16px",
                }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded text-sm font-medium"
                  style={{
                    backgroundColor:
                      index === 0 ? theme.colors.primary : theme.colors.muted,
                    color:
                      index === 0 ? "#FFFFFF" : theme.colors.mutedForeground,
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span
                  style={{
                    color: theme.colors.answerText,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Preview */}
        <div
          className="border-t p-4"
          style={{
            textAlign: theme.layout.questionAlignment,
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.headingFontFamily,
              fontSize: fontSize.subheading,
              color: theme.colors.questionText,
              fontWeight: fontWeightValue,
              marginBottom: "12px",
            }}
          >
            How would you rate us?
          </h3>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star
                key={rating}
                className="h-8 w-8 cursor-pointer transition-colors"
                style={{
                  color: rating <= 3 ? theme.colors.primary : theme.colors.muted,
                  fill: rating <= 3 ? theme.colors.primary : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar (Bottom) */}
        {theme.progressBar.type !== "none" &&
          theme.progressBar.position === "bottom" && (
            <div className="border-t p-2">
              <ProgressBarPreview
                type={theme.progressBar.type}
                color={theme.progressBar.color || theme.colors.primary}
                showPercentage={theme.progressBar.showPercentage}
                progress={35}
              />
            </div>
          )}

        {/* Powered By (if not hidden) */}
        {!theme.branding.hidePoweredBy && (
          <div className="border-t p-3 text-center">
            <span
              className="text-xs"
              style={{ color: theme.colors.mutedForeground }}
            >
              Powered by FormBuilder
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Progress Bar Preview Component
// ============================================

interface ProgressBarPreviewProps {
  type: "bar" | "dots" | "percentage" | "steps" | "none";
  color: string;
  showPercentage: boolean;
  progress: number;
}

function ProgressBarPreview({
  type,
  color,
  showPercentage,
  progress,
}: ProgressBarPreviewProps) {
  switch (type) {
    case "bar":
      return (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
          {showPercentage && (
            <p className="text-center text-xs opacity-70">{progress}%</p>
          )}
        </div>
      );

    case "dots":
      return (
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className="h-2 w-2 rounded-full transition-colors"
              style={{
                backgroundColor: dot <= 2 ? color : "rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>
      );

    case "percentage":
      return (
        <div className="text-center">
          <span className="text-lg font-semibold" style={{ color }}>
            {progress}%
          </span>
          <span className="ml-1 text-xs opacity-70">complete</span>
        </div>
      );

    case "steps":
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium" style={{ color }}>
            2
          </span>
          <span className="text-sm opacity-70">of 5</span>
        </div>
      );

    default:
      return null;
  }
}

export default ThemePreview;
