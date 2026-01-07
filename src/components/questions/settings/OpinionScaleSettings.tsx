"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { OpinionScaleSettings } from "../types";

interface OpinionScaleSettingsProps {
  settings: OpinionScaleSettings;
  onChange: (settings: OpinionScaleSettings) => void;
}

export function OpinionScaleSettingsPanel({
  settings,
  onChange,
}: OpinionScaleSettingsProps) {
  const updateSetting = <K extends keyof OpinionScaleSettings>(
    key: K,
    value: OpinionScaleSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min">Start at</Label>
          <Input
            id="min"
            type="number"
            min={0}
            max={1}
            value={settings.min ?? 1}
            onChange={(e) =>
              updateSetting("min", parseInt(e.target.value) || 1)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max">End at</Label>
          <Input
            id="max"
            type="number"
            min={5}
            max={10}
            value={settings.max ?? 5}
            onChange={(e) =>
              updateSetting("max", parseInt(e.target.value) || 5)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step">Step</Label>
          <Input
            id="step"
            type="number"
            min={1}
            max={2}
            value={settings.step ?? 1}
            onChange={(e) =>
              updateSetting("step", parseInt(e.target.value) || 1)
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lowLabel">Low label</Label>
        <Input
          id="lowLabel"
          value={settings.lowLabel || ""}
          onChange={(e) => updateSetting("lowLabel", e.target.value)}
          placeholder="Not at all likely"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="midLabel">Middle label (optional)</Label>
        <Input
          id="midLabel"
          value={settings.midLabel || ""}
          onChange={(e) => updateSetting("midLabel", e.target.value)}
          placeholder="Neutral"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highLabel">High label</Label>
        <Input
          id="highLabel"
          value={settings.highLabel || ""}
          onChange={(e) => updateSetting("highLabel", e.target.value)}
          placeholder="Extremely likely"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showLabels">Show labels</Label>
        <Switch
          id="showLabels"
          checked={settings.showLabels !== false}
          onCheckedChange={(checked) => updateSetting("showLabels", checked)}
        />
      </div>
    </div>
  );
}
