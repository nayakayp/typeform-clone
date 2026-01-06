"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UrlSettings } from "../types";

interface UrlSettingsProps {
  settings: UrlSettings;
  onChange: (settings: UrlSettings) => void;
}

export function UrlSettingsPanel({ settings, onChange }: UrlSettingsProps) {
  const updateSetting = <K extends keyof UrlSettings>(
    key: K,
    value: UrlSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder text</Label>
        <Input
          id="placeholder"
          value={settings.placeholder || ""}
          onChange={(e) => updateSetting("placeholder", e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="requireHttps">Require HTTPS</Label>
          <p className="text-muted-foreground text-xs">
            Only allow secure URLs
          </p>
        </div>
        <Switch
          id="requireHttps"
          checked={settings.requireHttps || false}
          onCheckedChange={(checked) => updateSetting("requireHttps", checked)}
        />
      </div>
    </div>
  );
}
