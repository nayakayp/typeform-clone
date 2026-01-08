"use client";

/**
 * ThemeEditor Component
 * Main theme editor with tabs for different theme sections
 */

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Palette,
  Type,
  Layout,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
} from "lucide-react";
import type { Theme } from "@/lib/theme/types";
import { THEME_TEMPLATES } from "@/lib/theme";
import { ColorPalette } from "./ColorPalette";
import { BackgroundEditor } from "./BackgroundEditor";
import { TypographyEditor } from "./TypographyEditor";
import { ThemePreview } from "./ThemePreview";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface ThemeEditorProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
  onReset?: () => void;
  showPreview?: boolean;
  className?: string;
}

// ============================================
// Component
// ============================================

export function ThemeEditor({
  theme,
  onChange,
  onReset,
  showPreview = true,
  className,
}: ThemeEditorProps) {
  const [activeTab, setActiveTab] = useState("colors");

  // Update specific theme section
  const updateTheme = useCallback(
    <K extends keyof Theme>(key: K, value: Theme[K]) => {
      onChange({ ...theme, [key]: value });
    },
    [theme, onChange]
  );

  // Apply template
  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = THEME_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        onChange({
          ...template.theme,
          id: theme.id,
          name: template.name,
          description: template.description,
        });
      }
    },
    [theme.id, onChange]
  );

  // Export theme
  const exportTheme = useCallback(() => {
    const json = JSON.stringify(theme, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, "-")}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [theme]);

  // Import theme
  const importTheme = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(
              event.target?.result as string
            ) as Theme;
            onChange({ ...imported, id: theme.id });
          } catch {
            console.error("Failed to parse theme file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [theme.id, onChange]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Theme Editor</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={importTheme}>
            <Upload className="mr-1 h-4 w-4" />
            Import
          </Button>
          <Button variant="ghost" size="sm" onClick={exportTheme}>
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Template Quick Select */}
      <div className="border-b p-4">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Quick Templates
        </p>
        <div className="flex flex-wrap gap-2">
          {THEME_TEMPLATES.slice(0, 5).map((template) => (
            <Button
              key={template.id}
              variant={theme.name === template.name ? "default" : "outline"}
              size="sm"
              onClick={() => applyTemplate(template.id)}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full flex-col"
          >
            <TabsList className="m-4 mb-0 grid w-auto grid-cols-4">
              <TabsTrigger value="colors" className="gap-1">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Colors</span>
              </TabsTrigger>
              <TabsTrigger value="background" className="gap-1">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Background</span>
              </TabsTrigger>
              <TabsTrigger value="typography" className="gap-1">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Typography</span>
              </TabsTrigger>
              <TabsTrigger value="effects" className="gap-1">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Effects</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-4">
              {/* Colors Tab */}
              <TabsContent value="colors" className="mt-0">
                <ColorPalette
                  colors={theme.colors}
                  onChange={(colors) => updateTheme("colors", colors)}
                />
              </TabsContent>

              {/* Background Tab */}
              <TabsContent value="background" className="mt-0">
                <BackgroundEditor
                  background={theme.background}
                  onChange={(background) => updateTheme("background", background)}
                />
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="mt-0">
                <TypographyEditor
                  typography={theme.typography}
                  layout={theme.layout}
                  buttons={theme.buttons}
                  onTypographyChange={(typography) =>
                    updateTheme("typography", typography)
                  }
                  onLayoutChange={(layout) => updateTheme("layout", layout)}
                  onButtonsChange={(buttons) => updateTheme("buttons", buttons)}
                />
              </TabsContent>

              {/* Effects Tab */}
              <TabsContent value="effects" className="mt-0">
                <EffectsEditor
                  progressBar={theme.progressBar}
                  animations={theme.animations}
                  branding={theme.branding}
                  formElements={theme.formElements}
                  onProgressBarChange={(progressBar) =>
                    updateTheme("progressBar", progressBar)
                  }
                  onAnimationsChange={(animations) =>
                    updateTheme("animations", animations)
                  }
                  onBrandingChange={(branding) =>
                    updateTheme("branding", branding)
                  }
                  onFormElementsChange={(formElements) =>
                    updateTheme("formElements", formElements)
                  }
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="hidden w-80 border-l lg:block">
            <ThemePreview theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Effects Editor (Internal Component)
// ============================================

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type {
  ThemeProgressBar,
  ThemeAnimations,
  ThemeBranding,
  ThemeFormElements,
} from "@/lib/theme/types";

interface EffectsEditorProps {
  progressBar: ThemeProgressBar;
  animations: ThemeAnimations;
  branding: ThemeBranding;
  formElements: ThemeFormElements;
  onProgressBarChange: (progressBar: ThemeProgressBar) => void;
  onAnimationsChange: (animations: ThemeAnimations) => void;
  onBrandingChange: (branding: ThemeBranding) => void;
  onFormElementsChange: (formElements: ThemeFormElements) => void;
}

function EffectsEditor({
  progressBar,
  animations,
  branding,
  formElements,
  onProgressBarChange,
  onAnimationsChange,
  onBrandingChange,
  onFormElementsChange,
}: EffectsEditorProps) {
  return (
    <div className="space-y-6">
      {/* Progress Bar Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Progress Bar</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={progressBar.type}
              onValueChange={(value) =>
                onProgressBarChange({
                  ...progressBar,
                  type: value as ThemeProgressBar["type"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="steps">Steps</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={progressBar.position}
              onValueChange={(value) =>
                onProgressBarChange({
                  ...progressBar,
                  position: value as ThemeProgressBar["position"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Percentage</Label>
            <Switch
              checked={progressBar.showPercentage}
              onCheckedChange={(checked) =>
                onProgressBarChange({
                  ...progressBar,
                  showPercentage: checked,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Animations Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Animations</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Transition</Label>
            <Select
              value={animations.transition}
              onValueChange={(value) =>
                onAnimationsChange({
                  ...animations,
                  transition: value as ThemeAnimations["transition"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="flip">Flip</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Speed</Label>
            <Select
              value={animations.speed}
              onValueChange={(value) =>
                onAnimationsChange({
                  ...animations,
                  speed: value as ThemeAnimations["speed"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Hover Effects</Label>
            <Switch
              checked={animations.enableHover}
              onCheckedChange={(checked) =>
                onAnimationsChange({
                  ...animations,
                  enableHover: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Focus Effects</Label>
            <Switch
              checked={animations.enableFocus}
              onCheckedChange={(checked) =>
                onAnimationsChange({
                  ...animations,
                  enableFocus: checked,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Branding</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              type="url"
              placeholder="https://example.com/logo.png"
              value={branding.logo || ""}
              onChange={(e) =>
                onBrandingChange({
                  ...branding,
                  logo: e.target.value || undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Logo Position</Label>
            <Select
              value={branding.logoPosition}
              onValueChange={(value) =>
                onBrandingChange({
                  ...branding,
                  logoPosition: value as ThemeBranding["logoPosition"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Hide &quot;Powered by&quot; badge</Label>
            <Switch
              checked={branding.hidePoweredBy}
              onCheckedChange={(checked) =>
                onBrandingChange({
                  ...branding,
                  hidePoweredBy: checked,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Form Elements Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Form Elements</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Input Style</Label>
            <Select
              value={formElements.inputStyle}
              onValueChange={(value) =>
                onFormElementsChange({
                  ...formElements,
                  inputStyle: value as ThemeFormElements["inputStyle"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box">Box (bordered)</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="borderless">Borderless</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question Number Style</Label>
            <Select
              value={formElements.questionNumberStyle}
              onValueChange={(value) =>
                onFormElementsChange({
                  ...formElements,
                  questionNumberStyle: value as ThemeFormElements["questionNumberStyle"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="badge">Badge (filled)</SelectItem>
                <SelectItem value="circle">Circle (outline)</SelectItem>
                <SelectItem value="arrow">Arrow (1 →)</SelectItem>
                <SelectItem value="plain">Plain (1.)</SelectItem>
                <SelectItem value="none">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Navigation Style</Label>
            <Select
              value={formElements.navigationStyle}
              onValueChange={(value) =>
                onFormElementsChange({
                  ...formElements,
                  navigationStyle: value as ThemeFormElements["navigationStyle"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corner-arrows">Corner Arrows (Typeform)</SelectItem>
                <SelectItem value="inline">Inline (Back/Next)</SelectItem>
                <SelectItem value="bottom-bar">Bottom Bar</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeEditor;
