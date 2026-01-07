"use client";

/**
 * ColorPalette Component
 * Color picker grid for theme colors
 */

import { useState, useCallback } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import type { ThemeColors } from "@/lib/theme/types";
import { COLOR_PALETTES } from "@/lib/theme/defaults";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface ColorPaletteProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
  className?: string;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  description?: string;
}

// ============================================
// Color Picker Component
// ============================================

function ColorPicker({ color, onChange, label, description }: ColorPickerProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [color]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex h-10 w-full items-center gap-3 rounded-md border bg-background px-3 transition-colors hover:bg-muted"
            type="button"
          >
            <div
              className="h-6 w-6 rounded-md border shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm uppercase">{color}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <HexColorPicker color={color} onChange={onChange} />
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-md border px-2">
                <span className="text-muted-foreground">#</span>
                <HexColorInput
                  color={color}
                  onChange={onChange}
                  prefixed={false}
                  className="h-9 flex-1 border-0 bg-transparent font-mono text-sm uppercase focus:outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ============================================
// Preset Palette Button
// ============================================

interface PresetPaletteButtonProps {
  name: string;
  colors: { primary: string; secondary: string; accent: string };
  isActive: boolean;
  onClick: () => void;
}

function PresetPaletteButton({
  name,
  colors,
  isActive,
  onClick,
}: PresetPaletteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border p-2 transition-all hover:border-primary",
        isActive && "border-primary ring-2 ring-primary/20"
      )}
    >
      <div className="flex gap-1">
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: colors.secondary }}
        />
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
      <span className="text-xs capitalize">{name}</span>
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export function ColorPalette({ colors, onChange, className }: ColorPaletteProps) {
  // Update single color
  const updateColor = useCallback(
    (key: keyof ThemeColors, value: string) => {
      onChange({ ...colors, [key]: value });
    },
    [colors, onChange]
  );

  // Apply preset palette
  const applyPreset = useCallback(
    (preset: { primary: string; secondary: string; accent: string }) => {
      onChange({
        ...colors,
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        ring: preset.primary,
      });
    },
    [colors, onChange]
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Preset Palettes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Color Presets</Label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(COLOR_PALETTES).map(([name, preset]) => (
            <PresetPaletteButton
              key={name}
              name={name}
              colors={preset}
              isActive={colors.primary === preset.primary}
              onClick={() => applyPreset(preset)}
            />
          ))}
        </div>
      </div>

      {/* Primary Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Primary Colors</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Primary"
            description="Buttons, links"
            color={colors.primary}
            onChange={(color) => updateColor("primary", color)}
          />
          <ColorPicker
            label="Secondary"
            description="Secondary elements"
            color={colors.secondary}
            onChange={(color) => updateColor("secondary", color)}
          />
        </div>
      </div>

      {/* Background Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Background & Surface</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Background"
            description="Page background"
            color={colors.background}
            onChange={(color) => updateColor("background", color)}
          />
          <ColorPicker
            label="Foreground"
            description="Main text color"
            color={colors.foreground}
            onChange={(color) => updateColor("foreground", color)}
          />
          <ColorPicker
            label="Muted"
            description="Subtle backgrounds"
            color={colors.muted}
            onChange={(color) => updateColor("muted", color)}
          />
          <ColorPicker
            label="Muted Foreground"
            description="Secondary text"
            color={colors.mutedForeground}
            onChange={(color) => updateColor("mutedForeground", color)}
          />
        </div>
      </div>

      {/* Accent Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Accent Colors</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Accent"
            description="Highlighted areas"
            color={colors.accent}
            onChange={(color) => updateColor("accent", color)}
          />
          <ColorPicker
            label="Accent Foreground"
            description="Accent text"
            color={colors.accentForeground}
            onChange={(color) => updateColor("accentForeground", color)}
          />
          <ColorPicker
            label="Destructive"
            description="Error states"
            color={colors.destructive}
            onChange={(color) => updateColor("destructive", color)}
          />
          <ColorPicker
            label="Ring"
            description="Focus rings"
            color={colors.ring}
            onChange={(color) => updateColor("ring", color)}
          />
        </div>
      </div>

      {/* Border & Input Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Borders & Inputs</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Border"
            description="Default borders"
            color={colors.border}
            onChange={(color) => updateColor("border", color)}
          />
          <ColorPicker
            label="Input"
            description="Input borders"
            color={colors.input}
            onChange={(color) => updateColor("input", color)}
          />
        </div>
      </div>

      {/* Question Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Question Styling</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Question Text"
            description="Question titles"
            color={colors.questionText}
            onChange={(color) => updateColor("questionText", color)}
          />
          <ColorPicker
            label="Question Background"
            description="Question area"
            color={colors.questionBackground}
            onChange={(color) => updateColor("questionBackground", color)}
          />
          <ColorPicker
            label="Answer Text"
            description="Answer input text"
            color={colors.answerText}
            onChange={(color) => updateColor("answerText", color)}
          />
          <ColorPicker
            label="Answer Background"
            description="Answer area"
            color={colors.answerBackground}
            onChange={(color) => updateColor("answerBackground", color)}
          />
        </div>
      </div>
    </div>
  );
}

export default ColorPalette;
