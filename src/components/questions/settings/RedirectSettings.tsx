"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { RedirectSettings } from "../types";

interface RedirectSettingsPanelProps {
  question: Omit<Question, "formId"> & { formId?: string };
  onUpdate: (settings: QuestionSettings) => void;
}

export function RedirectSettingsPanel({
  question,
  onUpdate,
}: RedirectSettingsPanelProps) {
  const settings = (question.settings || {}) as RedirectSettings;

  const updateSetting = <K extends keyof RedirectSettings>(
    key: K,
    value: RedirectSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="url">Redirect URL</Label>
        <Input
          id="url"
          type="url"
          value={settings.url || ""}
          onChange={(e) => updateSetting("url", e.target.value)}
          placeholder="https://example.com"
        />
        <p className="text-xs text-muted-foreground">
          The URL to redirect respondents to
        </p>
      </div>

      {/* Delay */}
      <div className="space-y-2">
        <Label htmlFor="delay">Delay (seconds)</Label>
        <Input
          id="delay"
          type="number"
          min={0}
          max={60}
          value={settings.delay ?? 3}
          onChange={(e) =>
            updateSetting("delay", parseInt(e.target.value) || 0)
          }
        />
        <p className="text-xs text-muted-foreground">
          How long to wait before redirecting (0 for immediate)
        </p>
      </div>

      {/* Open in new tab */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Open in New Tab</Label>
          <p className="text-xs text-muted-foreground">
            Open the URL in a new browser tab
          </p>
        </div>
        <Switch
          checked={settings.openInNewTab || false}
          onCheckedChange={(checked) => updateSetting("openInNewTab", checked)}
        />
      </div>

      {/* Custom message */}
      <div className="space-y-2">
        <Label htmlFor="showMessage">Loading Message</Label>
        <Textarea
          id="showMessage"
          value={settings.showMessage || ""}
          onChange={(e) => updateSetting("showMessage", e.target.value)}
          placeholder="Redirecting you to another page..."
          rows={2}
        />
      </div>

      {/* Pass response data */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Pass Response Data</Label>
          <p className="text-xs text-muted-foreground">
            Include form response data in URL parameters
          </p>
        </div>
        <Switch
          checked={settings.passResponseData || false}
          onCheckedChange={(checked) =>
            updateSetting("passResponseData", checked)
          }
        />
      </div>
    </div>
  );
}
