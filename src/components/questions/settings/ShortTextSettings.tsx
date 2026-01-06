"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ShortTextSettings } from "../types";

interface ShortTextSettingsProps {
  settings: ShortTextSettings;
  onChange: (settings: ShortTextSettings) => void;
}

export function ShortTextSettingsPanel({
  settings,
  onChange,
}: ShortTextSettingsProps) {
  const updateSetting = <K extends keyof ShortTextSettings>(
    key: K,
    value: ShortTextSettings[K]
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
          placeholder="Type your answer here..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultValue">Default value</Label>
        <Input
          id="defaultValue"
          value={settings.defaultValue || ""}
          onChange={(e) => updateSetting("defaultValue", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minLength">Min length</Label>
          <Input
            id="minLength"
            type="number"
            min={0}
            value={settings.minLength || ""}
            onChange={(e) =>
              updateSetting(
                "minLength",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxLength">Max length</Label>
          <Input
            id="maxLength"
            type="number"
            min={0}
            value={settings.maxLength || ""}
            onChange={(e) =>
              updateSetting(
                "maxLength",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern">Validation pattern (regex)</Label>
        <Input
          id="pattern"
          value={settings.pattern || ""}
          onChange={(e) => updateSetting("pattern", e.target.value)}
          placeholder="e.g., ^[A-Za-z]+$"
        />
      </div>
    </div>
  );
}
