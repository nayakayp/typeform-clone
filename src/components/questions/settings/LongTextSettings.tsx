"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LongTextSettings } from "../types";

interface LongTextSettingsProps {
  settings: LongTextSettings;
  onChange: (settings: LongTextSettings) => void;
}

export function LongTextSettingsPanel({
  settings,
  onChange,
}: LongTextSettingsProps) {
  const updateSetting = <K extends keyof LongTextSettings>(
    key: K,
    value: LongTextSettings[K]
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minLength">Min characters</Label>
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
          <Label htmlFor="maxLength">Max characters</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minWords">Min words</Label>
          <Input
            id="minWords"
            type="number"
            min={0}
            value={settings.minWords || ""}
            onChange={(e) =>
              updateSetting(
                "minWords",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxWords">Max words</Label>
          <Input
            id="maxWords"
            type="number"
            min={0}
            value={settings.maxWords || ""}
            onChange={(e) =>
              updateSetting(
                "maxWords",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rows">Number of rows</Label>
        <Input
          id="rows"
          type="number"
          min={2}
          max={20}
          value={settings.rows || 4}
          onChange={(e) => updateSetting("rows", parseInt(e.target.value) || 4)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="autoResize">Auto-resize</Label>
        <Switch
          id="autoResize"
          checked={settings.autoResize || false}
          onCheckedChange={(checked) => updateSetting("autoResize", checked)}
        />
      </div>
    </div>
  );
}
