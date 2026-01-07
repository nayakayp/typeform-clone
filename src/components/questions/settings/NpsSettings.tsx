"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NpsSettings } from "../types";

interface NpsSettingsProps {
  settings: NpsSettings;
  onChange: (settings: NpsSettings) => void;
}

export function NpsSettingsPanel({ settings, onChange }: NpsSettingsProps) {
  const updateSetting = <K extends keyof NpsSettings>(
    key: K,
    value: NpsSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lowLabel">Low label (0)</Label>
        <Input
          id="lowLabel"
          value={settings.lowLabel || ""}
          onChange={(e) => updateSetting("lowLabel", e.target.value)}
          placeholder="Not likely at all"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highLabel">High label (10)</Label>
        <Input
          id="highLabel"
          value={settings.highLabel || ""}
          onChange={(e) => updateSetting("highLabel", e.target.value)}
          placeholder="Extremely likely"
        />
      </div>

      <div className="bg-muted/50 rounded-lg border p-3">
        <p className="text-muted-foreground text-sm">
          <strong>NPS Score Categories:</strong>
        </p>
        <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Detractors (0-6)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            Passives (7-8)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            Promoters (9-10)
          </li>
        </ul>
      </div>
    </div>
  );
}
