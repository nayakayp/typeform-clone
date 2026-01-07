"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { ImageBlockSettings } from "../types";

interface ImageBlockSettingsPanelProps {
  question: Question;
  onUpdate: (settings: QuestionSettings) => void;
}

export function ImageBlockSettingsPanel({
  question,
  onUpdate,
}: ImageBlockSettingsPanelProps) {
  const settings = (question.settings || {}) as ImageBlockSettings;

  const updateSetting = <K extends keyof ImageBlockSettings>(
    key: K,
    value: ImageBlockSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="url">Image URL</Label>
        <Input
          id="url"
          type="url"
          value={settings.url || ""}
          onChange={(e) => updateSetting("url", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Alt text */}
      <div className="space-y-2">
        <Label htmlFor="alt">Alt Text</Label>
        <Input
          id="alt"
          value={settings.alt || ""}
          onChange={(e) => updateSetting("alt", e.target.value)}
          placeholder="Description of the image"
        />
        <p className="text-xs text-muted-foreground">
          Describes the image for screen readers and accessibility
        </p>
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Input
          id="caption"
          value={settings.caption || ""}
          onChange={(e) => updateSetting("caption", e.target.value)}
          placeholder="Optional caption below the image"
        />
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label>Size</Label>
        <Select
          value={settings.size || "medium"}
          onValueChange={(value: "small" | "medium" | "large" | "full") =>
            updateSetting("size", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="full">Full Width</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select
          value={settings.alignment || "center"}
          onValueChange={(value: "left" | "center" | "right") =>
            updateSetting("alignment", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Link */}
      <div className="space-y-2">
        <Label htmlFor="link">Link URL (optional)</Label>
        <Input
          id="link"
          type="url"
          value={settings.link || ""}
          onChange={(e) => updateSetting("link", e.target.value)}
          placeholder="https://example.com"
        />
        <p className="text-xs text-muted-foreground">
          Make the image clickable to open a URL
        </p>
      </div>

      {/* Lightbox */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Lightbox</Label>
          <p className="text-xs text-muted-foreground">
            Allow users to view the image full-size in a modal
          </p>
        </div>
        <Switch
          checked={settings.lightbox ?? true}
          onCheckedChange={(checked) => updateSetting("lightbox", checked)}
        />
      </div>
    </div>
  );
}
