"use client";

/**
 * TypographyEditor Component
 * Font and text settings editor
 */

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ThemeTypography,
  ThemeLayout,
  ThemeButtons,
} from "@/lib/theme/types";
import { FontSelector } from "./FontSelector";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface TypographyEditorProps {
  typography: ThemeTypography;
  layout: ThemeLayout;
  buttons: ThemeButtons;
  onTypographyChange: (typography: ThemeTypography) => void;
  onLayoutChange: (layout: ThemeLayout) => void;
  onButtonsChange: (buttons: ThemeButtons) => void;
  className?: string;
}

// ============================================
// Main Component
// ============================================

export function TypographyEditor({
  typography,
  layout,
  buttons,
  onTypographyChange,
  onLayoutChange,
  onButtonsChange,
  className,
}: TypographyEditorProps) {
  // Update typography
  const updateTypography = useCallback(
    <K extends keyof ThemeTypography>(key: K, value: ThemeTypography[K]) => {
      onTypographyChange({ ...typography, [key]: value });
    },
    [typography, onTypographyChange]
  );

  // Update layout
  const updateLayout = useCallback(
    <K extends keyof ThemeLayout>(key: K, value: ThemeLayout[K]) => {
      onLayoutChange({ ...layout, [key]: value });
    },
    [layout, onLayoutChange]
  );

  // Update buttons
  const updateButtons = useCallback(
    <K extends keyof ThemeButtons>(key: K, value: ThemeButtons[K]) => {
      onButtonsChange({ ...buttons, [key]: value });
    },
    [buttons, onButtonsChange]
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Font Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Fonts</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Body Font</Label>
            <FontSelector
              value={typography.fontFamily}
              onChange={(font) => updateTypography("fontFamily", font)}
            />
          </div>

          <div className="space-y-2">
            <Label>Heading Font</Label>
            <FontSelector
              value={typography.headingFontFamily}
              onChange={(font) => updateTypography("headingFontFamily", font)}
            />
          </div>
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Font Size</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Size</Label>
            <span className="text-sm text-muted-foreground capitalize">
              {typography.fontSize}
            </span>
          </div>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateTypography("fontSize", size)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  typography.fontSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary hover:bg-muted"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Font Weight</h3>

        <div className="space-y-2">
          <Select
            value={typography.fontWeight}
            onValueChange={(value) =>
              updateTypography("fontWeight", value as ThemeTypography["fontWeight"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="semibold">Semibold</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Line Height</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Spacing</Label>
            <span className="text-sm text-muted-foreground capitalize">
              {typography.lineHeight}
            </span>
          </div>
          <div className="flex gap-2">
            {(["tight", "normal", "relaxed"] as const).map((height) => (
              <button
                key={height}
                type="button"
                onClick={() => updateTypography("lineHeight", height)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  typography.lineHeight === height
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary hover:bg-muted"
                )}
              >
                {height}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Layout</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Question Alignment</Label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateLayout("questionAlignment", align)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                    layout.questionAlignment === align
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary hover:bg-muted"
                  )}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Width</Label>
            <Select
              value={layout.maxWidth}
              onValueChange={(value) =>
                updateLayout("maxWidth", value as ThemeLayout["maxWidth"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small (640px)</SelectItem>
                <SelectItem value="md">Medium (768px)</SelectItem>
                <SelectItem value="lg">Large (1024px)</SelectItem>
                <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Padding</Label>
            <div className="flex gap-2">
              {(["compact", "normal", "spacious"] as const).map((padding) => (
                <button
                  key={padding}
                  type="button"
                  onClick={() => updateLayout("padding", padding)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                    layout.padding === padding
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary hover:bg-muted"
                  )}
                >
                  {padding}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Position</Label>
            <Select
              value={layout.contentPosition}
              onValueChange={(value) =>
                updateLayout("contentPosition", value as ThemeLayout["contentPosition"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Button Styling */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Buttons</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Button Style</Label>
            <div className="flex gap-2">
              {(["solid", "outline", "ghost"] as const).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => updateButtons("variant", variant)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                    buttons.variant === variant
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary hover:bg-muted"
                  )}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Button Radius</Label>
            <Select
              value={buttons.radius}
              onValueChange={(value) =>
                updateButtons("radius", value as ThemeButtons["radius"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Square)</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="full">Full (Pill)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Button Size</Label>
            <div className="flex gap-2">
              {(["sm", "md", "lg"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateButtons("size", size)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm uppercase transition-colors",
                    buttons.size === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary hover:bg-muted"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Text */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Preview</h3>

        <div
          className="rounded-lg border p-6"
          style={{
            fontFamily: typography.fontFamily,
            textAlign: layout.questionAlignment,
          }}
        >
          <h2
            className="mb-2 text-2xl"
            style={{
              fontFamily: typography.headingFontFamily,
              fontWeight: typography.fontWeight === "light" ? 300 :
                          typography.fontWeight === "normal" ? 400 :
                          typography.fontWeight === "medium" ? 500 :
                          typography.fontWeight === "semibold" ? 600 : 700,
            }}
          >
            Sample Question Title
          </h2>
          <p className="mb-4 text-muted-foreground">
            This is how your question description will look with the selected typography
            settings.
          </p>
          <div
            className={cn(
              "inline-flex items-center justify-center px-4 py-2 transition-colors",
              buttons.variant === "solid"
                ? "bg-primary text-primary-foreground"
                : buttons.variant === "outline"
                  ? "border-2 border-primary text-primary"
                  : "text-primary hover:bg-muted"
            )}
            style={{
              borderRadius:
                buttons.radius === "none"
                  ? "0"
                  : buttons.radius === "sm"
                    ? "4px"
                    : buttons.radius === "md"
                      ? "8px"
                      : buttons.radius === "lg"
                        ? "12px"
                        : "9999px",
              padding:
                buttons.size === "sm"
                  ? "8px 16px"
                  : buttons.size === "md"
                    ? "12px 24px"
                    : "16px 32px",
            }}
          >
            Continue
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypographyEditor;
