"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeSettings } from "../types";

interface TimeSettingsProps {
  settings: TimeSettings;
  onChange: (settings: TimeSettings) => void;
}

export function TimeSettingsPanel({ settings, onChange }: TimeSettingsProps) {
  const updateSetting = <K extends keyof TimeSettings>(
    key: K,
    value: TimeSettings[K]
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
          placeholder="Select a time"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Time format</Label>
        <Select
          value={settings.format || "24h"}
          onValueChange={(value) =>
            updateSetting("format", value as "12h" | "24h")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24-hour (14:30)</SelectItem>
            <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minuteStep">Minute intervals</Label>
        <Select
          value={String(settings.minuteStep || 1)}
          onValueChange={(value) =>
            updateSetting("minuteStep", parseInt(value))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 minute</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minTime">Earliest time</Label>
          <Input
            id="minTime"
            type="time"
            value={settings.minTime || ""}
            onChange={(e) => updateSetting("minTime", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxTime">Latest time</Label>
          <Input
            id="maxTime"
            type="time"
            value={settings.maxTime || ""}
            onChange={(e) => updateSetting("maxTime", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
