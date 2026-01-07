"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { ThankYouScreenSettings } from "../types";

interface ThankYouScreenSettingsPanelProps {
  question: Omit<Question, "formId"> & { formId?: string };
  onUpdate: (settings: QuestionSettings) => void;
}

export function ThankYouScreenSettingsPanel({
  question,
  onUpdate,
}: ThankYouScreenSettingsPanelProps) {
  const settings = (question.settings || {}) as ThankYouScreenSettings;

  const updateSetting = <K extends keyof ThankYouScreenSettings>(
    key: K,
    value: ThankYouScreenSettings[K]
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
          placeholder="Thank you!"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={settings.description || ""}
          onChange={(e) => updateSetting("description", e.target.value)}
          placeholder="Your response has been recorded."
          rows={3}
        />
      </div>

      {/* Show confetti */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Show Confetti</Label>
          <p className="text-xs text-muted-foreground">
            Celebrate with a confetti animation
          </p>
        </div>
        <Switch
          checked={settings.showConfetti ?? true}
          onCheckedChange={(checked) => updateSetting("showConfetti", checked)}
        />
      </div>

      {/* Social share */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Show Social Share</Label>
          <p className="text-xs text-muted-foreground">
            Allow respondents to share on social media
          </p>
        </div>
        <Switch
          checked={settings.showSocialShare || false}
          onCheckedChange={(checked) =>
            updateSetting("showSocialShare", checked)
          }
        />
      </div>

      {settings.showSocialShare && (
        <div className="space-y-2">
          <Label htmlFor="socialMessage">Social Share Message</Label>
          <Input
            id="socialMessage"
            value={settings.socialMessage || ""}
            onChange={(e) => updateSetting("socialMessage", e.target.value)}
            placeholder="I just completed a survey!"
          />
        </div>
      )}

      {/* Redirect */}
      <div className="space-y-2">
        <Label htmlFor="redirectUrl">Redirect URL (optional)</Label>
        <Input
          id="redirectUrl"
          type="url"
          value={settings.redirectUrl || ""}
          onChange={(e) => updateSetting("redirectUrl", e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {settings.redirectUrl && (
        <div className="space-y-2">
          <Label htmlFor="redirectDelay">Redirect Delay (seconds)</Label>
          <Input
            id="redirectDelay"
            type="number"
            min={0}
            value={settings.redirectDelay || 5}
            onChange={(e) =>
              updateSetting("redirectDelay", parseInt(e.target.value) || 5)
            }
          />
        </div>
      )}

      {/* Custom button */}
      <div className="space-y-2">
        <Label htmlFor="buttonText">Custom Button Text (optional)</Label>
        <Input
          id="buttonText"
          value={settings.buttonText || ""}
          onChange={(e) => updateSetting("buttonText", e.target.value)}
          placeholder="Visit our website"
        />
      </div>

      {settings.buttonText && (
        <div className="space-y-2">
          <Label htmlFor="buttonUrl">Button URL</Label>
          <Input
            id="buttonUrl"
            type="url"
            value={settings.buttonUrl || ""}
            onChange={(e) => updateSetting("buttonUrl", e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      )}
    </div>
  );
}
