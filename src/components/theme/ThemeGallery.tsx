"use client";

/**
 * ThemeGallery Component
 * Gallery view with tabs for "My themes" and "Gallery"
 */

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemePreviewCard } from "./ThemePreviewCard";
import { THEME_TEMPLATES } from "@/lib/theme";
import type { Theme } from "@/lib/theme/types";
import type { ThemeTemplate } from "@/lib/theme/types";
import { cn } from "@/lib/utils";

interface ThemeGalleryProps {
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  onEditTheme?: () => void;
  userThemes?: ThemeTemplate[];
  className?: string;
}

// Convert Theme to ThemeTemplate for display
function themeToTemplate(theme: Theme): ThemeTemplate {
  return {
    id: theme.id || "current",
    name: theme.name || "Current Theme",
    description: theme.description || "",
    theme: {
      colors: theme.colors,
      background: theme.background,
      typography: theme.typography,
      layout: theme.layout,
      buttons: theme.buttons,
      progressBar: theme.progressBar,
      branding: theme.branding,
      animations: theme.animations,
    },
  };
}

// Check if two themes are similar (for selection highlighting)
function areThemesSimilar(theme1: Theme, template: ThemeTemplate): boolean {
  return (
    theme1.colors.primary === template.theme.colors.primary &&
    theme1.colors.background === template.theme.colors.background &&
    theme1.background.type === template.theme.background.type
  );
}

export function ThemeGallery({
  currentTheme,
  onSelectTheme,
  onEditTheme,
  userThemes = [],
  className,
}: ThemeGalleryProps) {
  const [activeTab, setActiveTab] = useState<"my-themes" | "gallery">("gallery");

  // Current theme as a template for "My themes" tab
  const currentAsTemplate = useMemo(() => themeToTemplate(currentTheme), [currentTheme]);

  // Find which template is currently selected
  const selectedTemplateId = useMemo(() => {
    for (const template of THEME_TEMPLATES) {
      if (areThemesSimilar(currentTheme, template)) {
        return template.id;
      }
    }
    // Check user themes
    for (const template of userThemes) {
      if (areThemesSimilar(currentTheme, template)) {
        return template.id;
      }
    }
    return null;
  }, [currentTheme, userThemes]);

  // Handle template selection
  const handleSelectTemplate = (template: ThemeTemplate) => {
    onSelectTheme({
      ...template.theme,
      id: currentTheme.id,
      name: template.name,
      description: template.description,
    });
  };

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "my-themes" | "gallery")}
        className="flex h-full flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mt-2 grid w-auto shrink-0 grid-cols-2">
          <TabsTrigger value="my-themes">My themes</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/* My Themes Tab */}
          <TabsContent value="my-themes" className="mt-0">
            <div className="grid grid-cols-2 gap-3">
              {/* Current/Custom theme */}
              <ThemePreviewCard
                template={currentAsTemplate}
                isSelected={selectedTemplateId === null}
                onSelect={() => {}}
                onEdit={onEditTheme}
                showActions={true}
              />

              {/* User saved themes */}
              {userThemes.map((template) => (
                <ThemePreviewCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={() => handleSelectTemplate(template)}
                  onEdit={onEditTheme}
                  showActions={true}
                />
              ))}

              {/* Empty state if no user themes */}
              {userThemes.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                  <p>No saved themes yet.</p>
                  <p className="mt-1">Select a theme from the Gallery and customize it.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-0">
            <div className="grid grid-cols-2 gap-3 pb-4">
              {THEME_TEMPLATES.map((template) => (
                <ThemePreviewCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={() => handleSelectTemplate(template)}
                  onEdit={onEditTheme}
                  showActions={true}
                />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default ThemeGallery;
