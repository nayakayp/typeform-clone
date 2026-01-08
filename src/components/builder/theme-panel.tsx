"use client";

import { useCallback, useMemo, useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { ThemeEditor, ThemeGallery } from "@/components/theme";
import { DEFAULT_THEME } from "@/lib/theme/defaults";
import type { Theme } from "@/lib/theme/types";
import type { CustomTheme } from "@/lib/db/schema/forms";
import { X, GripVertical, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ThemePanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Convert CustomTheme from database to full Theme object
 */
function customThemeToTheme(customTheme: CustomTheme | null | undefined): Theme {
  if (!customTheme) {
    return { ...DEFAULT_THEME };
  }

  // Start with defaults
  const theme: Theme = { ...DEFAULT_THEME };

  // If we have the new full theme structure, use it
  if (customTheme.colors) {
    theme.colors = { ...DEFAULT_THEME.colors, ...customTheme.colors };
  } else {
    // Legacy: map old simple fields to new structure
    theme.colors = {
      ...DEFAULT_THEME.colors,
      primary: customTheme.primaryColor || DEFAULT_THEME.colors.primary,
      background: customTheme.backgroundColor || DEFAULT_THEME.colors.background,
      foreground: customTheme.textColor || DEFAULT_THEME.colors.foreground,
      questionText: customTheme.textColor || DEFAULT_THEME.colors.questionText,
    };
  }

  if (customTheme.background) {
    theme.background = {
      ...DEFAULT_THEME.background,
      type: customTheme.background.type || DEFAULT_THEME.background.type,
      color: customTheme.background.color || DEFAULT_THEME.background.color,
      gradient: customTheme.background.gradient
        ? {
            type: customTheme.background.gradient.type || "linear",
            angle: customTheme.background.gradient.angle ?? 180,
            stops: customTheme.background.gradient.stops || [],
          }
        : undefined,
      image: customTheme.background.image
        ? {
            url: customTheme.background.image.url || "",
            size: customTheme.background.image.size || "cover",
            position: customTheme.background.image.position || "center",
            repeat: customTheme.background.image.repeat || "no-repeat",
            overlay: customTheme.background.image.overlay,
          }
        : undefined,
    };
  } else if (customTheme.backgroundImage) {
    // Legacy: map old backgroundImage to new structure
    theme.background = {
      type: "image",
      image: {
        url: customTheme.backgroundImage,
        size: "cover",
        position: "center",
        repeat: "no-repeat",
      },
    };
  }

  if (customTheme.typography) {
    theme.typography = { ...DEFAULT_THEME.typography, ...customTheme.typography };
  } else if (customTheme.fontFamily) {
    // Legacy: map old fontFamily to new structure
    theme.typography = {
      ...DEFAULT_THEME.typography,
      fontFamily: customTheme.fontFamily,
      headingFontFamily: customTheme.fontFamily,
    };
  }

  if (customTheme.layout) {
    theme.layout = { ...DEFAULT_THEME.layout, ...customTheme.layout };
  }

  if (customTheme.buttons) {
    theme.buttons = { ...DEFAULT_THEME.buttons, ...customTheme.buttons };
  }

  if (customTheme.formElements) {
    theme.formElements = { ...DEFAULT_THEME.formElements, ...customTheme.formElements };
  }

  if (customTheme.progressBar) {
    theme.progressBar = { ...DEFAULT_THEME.progressBar, ...customTheme.progressBar };
  }

  if (customTheme.branding) {
    theme.branding = { ...DEFAULT_THEME.branding, ...customTheme.branding };
  }

  if (customTheme.animations) {
    theme.animations = { ...DEFAULT_THEME.animations, ...customTheme.animations };
  }

  if (customTheme.name) {
    theme.name = customTheme.name;
  }

  return theme;
}

/**
 * Convert Theme object back to CustomTheme for storage
 */
function themeToCustomTheme(theme: Theme): CustomTheme {
  return {
    name: theme.name,
    colors: theme.colors,
    background: theme.background,
    typography: theme.typography,
    layout: theme.layout,
    buttons: theme.buttons,
    formElements: theme.formElements,
    progressBar: theme.progressBar,
    branding: theme.branding,
    animations: theme.animations,
    // Also set legacy fields for backwards compatibility
    primaryColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    textColor: theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
  };
}

export function ThemePanel({ children, className }: ThemePanelProps) {
  const { form, updateFormMeta } = useBuilderStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Convert stored customTheme to full Theme object
  const theme = useMemo(() => {
    return customThemeToTheme(form?.customTheme);
  }, [form?.customTheme]);

  // Handle theme changes
  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      const customTheme = themeToCustomTheme(newTheme);
      updateFormMeta({ customTheme });
    },
    [updateFormMeta]
  );

  // Reset to default theme
  const handleReset = useCallback(() => {
    updateFormMeta({ customTheme: null });
  }, [updateFormMeta]);

  // Handle back from editor to gallery
  const handleBackToGallery = () => {
    setShowEditor(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[420px] p-0",
          className
        )}
        align="end"
        sideOffset={8}
      >
        <div className="flex h-[520px] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              {showEditor && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleBackToGallery}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Design</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showEditor ? (
              <ThemeEditor
                theme={theme}
                onChange={handleThemeChange}
                onReset={handleReset}
                showPreview={false}
                className="h-full"
              />
            ) : (
              <ThemeGallery
                currentTheme={theme}
                onSelectTheme={handleThemeChange}
                onEditTheme={() => setShowEditor(true)}
                className="h-full"
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { customThemeToTheme, themeToCustomTheme };
