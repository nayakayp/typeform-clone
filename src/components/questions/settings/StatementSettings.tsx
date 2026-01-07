"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { StatementSettings } from "../types";

interface StatementSettingsPanelProps {
  question: Omit<Question, "formId"> & { formId?: string };
  onUpdate: (settings: QuestionSettings) => void;
}

export function StatementSettingsPanel({
  question,
  onUpdate,
}: StatementSettingsPanelProps) {
  const settings = (question.settings || {}) as StatementSettings;

  const updateSetting = <K extends keyof StatementSettings>(
    key: K,
    value: StatementSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={settings.content || ""}
          onChange={(e) => updateSetting("content", e.target.value)}
          placeholder="Enter your statement text..."
          rows={5}
        />
      </div>

      {/* Content type */}
      <div className="space-y-2">
        <Label>Content Type</Label>
        <Select
          value={settings.contentType || "plain"}
          onValueChange={(value: "plain" | "markdown") =>
            updateSetting("contentType", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Button text */}
      <div className="space-y-2">
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          value={settings.buttonText || ""}
          onChange={(e) => updateSetting("buttonText", e.target.value)}
          placeholder="Continue"
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          type="url"
          value={settings.image || ""}
          onChange={(e) => updateSetting("image", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Image position */}
      {settings.image && (
        <div className="space-y-2">
          <Label>Image Position</Label>
          <Select
            value={settings.imagePosition || "right"}
            onValueChange={(
              value: "left" | "right" | "top" | "bottom" | "background"
            ) => updateSetting("imagePosition", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="background">Background</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Text alignment */}
      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <Select
          value={settings.textAlignment || "left"}
          onValueChange={(value: "left" | "center" | "right") =>
            updateSetting("textAlignment", value)
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
    </div>
  );
}
