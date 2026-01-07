"use client";

import * as React from "react";
import { Copy, Check, Code2, ExternalLink, PanelRight, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type EmbedType,
  type StandardEmbedOptions,
  type PopupEmbedOptions,
  type SliderEmbedOptions,
  type WidgetEmbedOptions,
  DEFAULT_STANDARD_EMBED_OPTIONS,
  DEFAULT_POPUP_EMBED_OPTIONS,
  DEFAULT_SLIDER_EMBED_OPTIONS,
  DEFAULT_WIDGET_EMBED_OPTIONS,
} from "@/lib/share/types";
import {
  generateStandardEmbedCode,
  generatePopupEmbedCode,
  generateSliderEmbedCode,
  generateWidgetEmbedCode,
  copyToClipboard,
} from "@/lib/share/utils";

export interface EmbedCodeGeneratorProps {
  formUrl: string;
  className?: string;
  onEmbedTypeChange?: (type: EmbedType) => void;
  onOptionsChange?: (options: StandardEmbedOptions | PopupEmbedOptions | SliderEmbedOptions | WidgetEmbedOptions) => void;
}

export function EmbedCodeGenerator({
  formUrl,
  className,
  onEmbedTypeChange,
  onOptionsChange,
}: EmbedCodeGeneratorProps) {
  const [embedType, setEmbedType] = React.useState<EmbedType>("standard");
  const [copied, setCopied] = React.useState(false);

  // Options state for each embed type
  const [standardOptions, setStandardOptions] = React.useState<StandardEmbedOptions>(
    DEFAULT_STANDARD_EMBED_OPTIONS
  );
  const [popupOptions, setPopupOptions] = React.useState<PopupEmbedOptions>(
    DEFAULT_POPUP_EMBED_OPTIONS
  );
  const [sliderOptions, setSliderOptions] = React.useState<SliderEmbedOptions>(
    DEFAULT_SLIDER_EMBED_OPTIONS
  );
  const [widgetOptions, setWidgetOptions] = React.useState<WidgetEmbedOptions>(
    DEFAULT_WIDGET_EMBED_OPTIONS
  );

  // Get current options based on embed type
  const getCurrentOptions = React.useCallback(() => {
    switch (embedType) {
      case "standard":
        return standardOptions;
      case "popup":
        return popupOptions;
      case "slider":
        return sliderOptions;
      case "widget":
        return widgetOptions;
      default:
        return standardOptions;
    }
  }, [embedType, standardOptions, popupOptions, sliderOptions, widgetOptions]);

  // Generate embed code based on current type and options
  const generateCode = () => {
    switch (embedType) {
      case "standard":
        return generateStandardEmbedCode(formUrl, standardOptions);
      case "popup":
        return generatePopupEmbedCode(formUrl, popupOptions);
      case "slider":
        return generateSliderEmbedCode(formUrl, sliderOptions);
      case "widget":
        return generateWidgetEmbedCode(formUrl, widgetOptions);
      default:
        return generateStandardEmbedCode(formUrl, standardOptions);
    }
  };

  const embedCode = generateCode();

  const handleCopy = async () => {
    const success = await copyToClipboard(embedCode.fullCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmbedTypeChange = (type: string) => {
    setEmbedType(type as EmbedType);
    onEmbedTypeChange?.(type as EmbedType);
  };

  // Notify parent of options changes
  React.useEffect(() => {
    onOptionsChange?.(getCurrentOptions());
  }, [getCurrentOptions, onOptionsChange]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Embed Type Selection */}
      <Tabs value={embedType} onValueChange={handleEmbedTypeChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="standard" className="gap-2">
            <Code2 className="size-4" />
            <span className="hidden sm:inline">Inline</span>
          </TabsTrigger>
          <TabsTrigger value="popup" className="gap-2">
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">Popup</span>
          </TabsTrigger>
          <TabsTrigger value="slider" className="gap-2">
            <PanelRight className="size-4" />
            <span className="hidden sm:inline">Slider</span>
          </TabsTrigger>
          <TabsTrigger value="widget" className="gap-2">
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Widget</span>
          </TabsTrigger>
        </TabsList>

        {/* Standard Embed Options */}
        <TabsContent value="standard" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Embed the form directly on your page using an iframe.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="standard-width">Width</Label>
              <Input
                id="standard-width"
                value={standardOptions.width}
                onChange={(e) =>
                  setStandardOptions((prev) => ({ ...prev, width: e.target.value }))
                }
                placeholder="100%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard-height">Height</Label>
              <Input
                id="standard-height"
                value={standardOptions.height}
                onChange={(e) =>
                  setStandardOptions((prev) => ({ ...prev, height: e.target.value }))
                }
                placeholder="500px"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="standard-hide-title">Hide title</Label>
              <Switch
                id="standard-hide-title"
                checked={standardOptions.hideTitle}
                onCheckedChange={(checked) =>
                  setStandardOptions((prev) => ({ ...prev, hideTitle: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="standard-hide-footer">Hide footer</Label>
              <Switch
                id="standard-hide-footer"
                checked={standardOptions.hideFooter}
                onCheckedChange={(checked) =>
                  setStandardOptions((prev) => ({ ...prev, hideFooter: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="standard-transparent">Transparent background</Label>
              <Switch
                id="standard-transparent"
                checked={standardOptions.transparentBackground}
                onCheckedChange={(checked) =>
                  setStandardOptions((prev) => ({
                    ...prev,
                    transparentBackground: checked,
                  }))
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* Popup Embed Options */}
        <TabsContent value="popup" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Open the form in a modal popup when a button is clicked.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="popup-button-text">Button text</Label>
              <Input
                id="popup-button-text"
                value={popupOptions.buttonText}
                onChange={(e) =>
                  setPopupOptions((prev) => ({ ...prev, buttonText: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="popup-button-color">Button color</Label>
              <div className="flex gap-2">
                <Input
                  id="popup-button-color"
                  type="color"
                  value={popupOptions.buttonColor}
                  onChange={(e) =>
                    setPopupOptions((prev) => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="h-9 w-12 cursor-pointer p-1"
                />
                <Input
                  type="text"
                  value={popupOptions.buttonColor}
                  onChange={(e) =>
                    setPopupOptions((prev) => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="popup-width">Popup width</Label>
              <Input
                id="popup-width"
                value={popupOptions.width}
                onChange={(e) =>
                  setPopupOptions((prev) => ({ ...prev, width: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="popup-height">Popup height</Label>
              <Input
                id="popup-height"
                value={popupOptions.height}
                onChange={(e) =>
                  setPopupOptions((prev) => ({ ...prev, height: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="popup-hide-title">Hide title</Label>
              <Switch
                id="popup-hide-title"
                checked={popupOptions.hideTitle}
                onCheckedChange={(checked) =>
                  setPopupOptions((prev) => ({ ...prev, hideTitle: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="popup-hide-footer">Hide footer</Label>
              <Switch
                id="popup-hide-footer"
                checked={popupOptions.hideFooter}
                onCheckedChange={(checked) =>
                  setPopupOptions((prev) => ({ ...prev, hideFooter: checked }))
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* Slider Embed Options */}
        <TabsContent value="slider" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Slide the form in from the side of the screen.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slider-button-text">Button text</Label>
              <Input
                id="slider-button-text"
                value={sliderOptions.buttonText}
                onChange={(e) =>
                  setSliderOptions((prev) => ({ ...prev, buttonText: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slider-position">Position</Label>
              <Select
                value={sliderOptions.position}
                onValueChange={(value) =>
                  setSliderOptions((prev) => ({
                    ...prev,
                    position: value as "left" | "right",
                  }))
                }
              >
                <SelectTrigger id="slider-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slider-button-color">Button color</Label>
              <div className="flex gap-2">
                <Input
                  id="slider-button-color"
                  type="color"
                  value={sliderOptions.buttonColor}
                  onChange={(e) =>
                    setSliderOptions((prev) => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="h-9 w-12 cursor-pointer p-1"
                />
                <Input
                  type="text"
                  value={sliderOptions.buttonColor}
                  onChange={(e) =>
                    setSliderOptions((prev) => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slider-width">Panel width</Label>
              <Input
                id="slider-width"
                value={sliderOptions.width}
                onChange={(e) =>
                  setSliderOptions((prev) => ({ ...prev, width: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="slider-hide-title">Hide title</Label>
              <Switch
                id="slider-hide-title"
                checked={sliderOptions.hideTitle}
                onCheckedChange={(checked) =>
                  setSliderOptions((prev) => ({ ...prev, hideTitle: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="slider-hide-footer">Hide footer</Label>
              <Switch
                id="slider-hide-footer"
                checked={sliderOptions.hideFooter}
                onCheckedChange={(checked) =>
                  setSliderOptions((prev) => ({ ...prev, hideFooter: checked }))
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* Widget Embed Options */}
        <TabsContent value="widget" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Add a chat-style widget to your site that opens the form.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="widget-position">Position</Label>
              <Select
                value={widgetOptions.position}
                onValueChange={(value) =>
                  setWidgetOptions((prev) => ({
                    ...prev,
                    position: value as "bottom-left" | "bottom-right",
                  }))
                }
              >
                <SelectTrigger id="widget-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-icon">Button icon</Label>
              <Select
                value={widgetOptions.buttonIcon}
                onValueChange={(value) =>
                  setWidgetOptions((prev) => ({
                    ...prev,
                    buttonIcon: value as "chat" | "form" | "help",
                  }))
                }
              >
                <SelectTrigger id="widget-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="help">Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="widget-button-color">Button color</Label>
              <div className="flex gap-2">
                <Input
                  id="widget-button-color"
                  type="color"
                  value={widgetOptions.buttonColor}
                  onChange={(e) =>
                    setWidgetOptions((prev) => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="h-9 w-12 cursor-pointer p-1"
                />
                <Input
                  type="text"
                  value={widgetOptions.buttonColor}
                  onChange={(e) =>
                    setWidgetOptions((prev) => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-greeting">Greeting message</Label>
              <Input
                id="widget-greeting"
                value={widgetOptions.greeting}
                onChange={(e) =>
                  setWidgetOptions((prev) => ({ ...prev, greeting: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="widget-hide-title">Hide title</Label>
              <Switch
                id="widget-hide-title"
                checked={widgetOptions.hideTitle}
                onCheckedChange={(checked) =>
                  setWidgetOptions((prev) => ({ ...prev, hideTitle: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="widget-hide-footer">Hide footer</Label>
              <Switch
                id="widget-hide-footer"
                checked={widgetOptions.hideFooter}
                onCheckedChange={(checked) =>
                  setWidgetOptions((prev) => ({ ...prev, hideFooter: checked }))
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Embed code</Label>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 size-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                Copy code
              </>
            )}
          </Button>
        </div>
        <pre className="bg-muted max-h-[200px] overflow-auto rounded-lg p-4 text-sm">
          <code>{embedCode.fullCode}</code>
        </pre>
      </div>
    </div>
  );
}
