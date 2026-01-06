"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NumberSettings } from "../types";

interface NumberSettingsProps {
  settings: NumberSettings;
  onChange: (settings: NumberSettings) => void;
}

export function NumberSettingsPanel({
  settings,
  onChange,
}: NumberSettingsProps) {
  const updateSetting = <K extends keyof NumberSettings>(
    key: K,
    value: NumberSettings[K]
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
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min">Minimum value</Label>
          <Input
            id="min"
            type="number"
            value={settings.min ?? ""}
            onChange={(e) =>
              updateSetting(
                "min",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max">Maximum value</Label>
          <Input
            id="max"
            type="number"
            value={settings.max ?? ""}
            onChange={(e) =>
              updateSetting(
                "max",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="step">Step</Label>
          <Input
            id="step"
            type="number"
            min={0}
            step="any"
            value={settings.step ?? 1}
            onChange={(e) =>
              updateSetting("step", parseFloat(e.target.value) || 1)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="decimalPlaces">Decimal places</Label>
          <Input
            id="decimalPlaces"
            type="number"
            min={0}
            max={10}
            value={settings.decimalPlaces ?? ""}
            onChange={(e) =>
              updateSetting(
                "decimalPlaces",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prefix">Prefix</Label>
          <Input
            id="prefix"
            value={settings.prefix || ""}
            onChange={(e) => updateSetting("prefix", e.target.value)}
            placeholder="$"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="suffix">Suffix</Label>
          <Input
            id="suffix"
            value={settings.suffix || ""}
            onChange={(e) => updateSetting("suffix", e.target.value)}
            placeholder="kg"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showButtons">Show increment/decrement buttons</Label>
        <Switch
          id="showButtons"
          checked={settings.showButtons || false}
          onCheckedChange={(checked) => updateSetting("showButtons", checked)}
        />
      </div>
    </div>
  );
}
