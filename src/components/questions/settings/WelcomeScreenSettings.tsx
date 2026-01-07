"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { WelcomeScreenSettings } from "../types";

interface WelcomeScreenSettingsPanelProps {
  question: Omit<Question, "formId"> & { formId?: string };
  onUpdate: (settings: QuestionSettings) => void;
}

export function WelcomeScreenSettingsPanel({
  question,
  onUpdate,
}: WelcomeScreenSettingsPanelProps) {
  const settings = (question.settings || {}) as WelcomeScreenSettings;

  const updateSetting = <K extends keyof WelcomeScreenSettings>(
    key: K,
    value: WelcomeScreenSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={settings.title || ""}
          onChange={(e) => updateSetting("title", e.target.value)}
          placeholder="Welcome to our survey"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={settings.description || ""}
          onChange={(e) => updateSetting("description", e.target.value)}
          placeholder="A short introduction to your form..."
          rows={3}
        />
      </div>

      {/* Button text */}
      <div className="space-y-2">
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          value={settings.buttonText || ""}
          onChange={(e) => updateSetting("buttonText", e.target.value)}
          placeholder="Start"
        />
      </div>

      {/* Background image */}
      <div className="space-y-2">
        <Label htmlFor="image">Background Image URL</Label>
        <Input
          id="image"
          type="url"
          value={settings.image || ""}
          onChange={(e) => updateSetting("image", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Background video */}
      <div className="space-y-2">
        <Label htmlFor="video">Background Video URL</Label>
        <Input
          id="video"
          type="url"
          value={settings.video || ""}
          onChange={(e) => updateSetting("video", e.target.value)}
          placeholder="https://example.com/video.mp4"
        />
        <p className="text-xs text-muted-foreground">
          Video is used if no image is set
        </p>
      </div>

      {/* Estimated time */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Show Estimated Time</Label>
          <p className="text-xs text-muted-foreground">
            Display how long the form takes to complete
          </p>
        </div>
        <Switch
          checked={settings.showEstimatedTime || false}
          onCheckedChange={(checked) =>
            updateSetting("showEstimatedTime", checked)
          }
        />
      </div>

      {settings.showEstimatedTime && (
        <div className="space-y-2">
          <Label htmlFor="estimatedMinutes">Estimated Minutes</Label>
          <Input
            id="estimatedMinutes"
            type="number"
            min={1}
            value={settings.estimatedMinutes || ""}
            onChange={(e) =>
              updateSetting("estimatedMinutes", parseInt(e.target.value) || undefined)
            }
            placeholder="5"
          />
        </div>
      )}
    </div>
  );
}
