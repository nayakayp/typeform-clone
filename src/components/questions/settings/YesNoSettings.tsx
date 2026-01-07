"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { YesNoSettings } from "../types";

interface YesNoSettingsProps {
  settings: YesNoSettings;
  onChange: (settings: YesNoSettings) => void;
}

export function YesNoSettingsPanel({ settings, onChange }: YesNoSettingsProps) {
  const updateSetting = <K extends keyof YesNoSettings>(
    key: K,
    value: YesNoSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="yesLabel">Yes label</Label>
        <Input
          id="yesLabel"
          value={settings.yesLabel || ""}
          onChange={(e) => updateSetting("yesLabel", e.target.value)}
          placeholder="Yes"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="noLabel">No label</Label>
        <Input
          id="noLabel"
          value={settings.noLabel || ""}
          onChange={(e) => updateSetting("noLabel", e.target.value)}
          placeholder="No"
        />
      </div>
    </div>
  );
}
