"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { DateSettings } from "../types";

interface DateSettingsProps {
  settings: DateSettings;
  onChange: (settings: DateSettings) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function DateSettingsPanel({ settings, onChange }: DateSettingsProps) {
  const updateSetting = <K extends keyof DateSettings>(
    key: K,
    value: DateSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const toggleDisabledDay = (day: number) => {
    const currentDays = settings.disabledDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    updateSetting("disabledDays", newDays.length > 0 ? newDays : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder text</Label>
        <Input
          id="placeholder"
          value={settings.placeholder || ""}
          onChange={(e) => updateSetting("placeholder", e.target.value)}
          placeholder="Pick a date"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Date format</Label>
        <Input
          id="format"
          value={settings.format || ""}
          onChange={(e) => updateSetting("format", e.target.value)}
          placeholder="PPP (e.g., January 1, 2024)"
        />
        <p className="text-muted-foreground text-xs">
          Uses date-fns format tokens
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minDate">Earliest date</Label>
          <Input
            id="minDate"
            type="date"
            value={settings.minDate || ""}
            onChange={(e) => updateSetting("minDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDate">Latest date</Label>
          <Input
            id="maxDate"
            type="date"
            value={settings.maxDate || ""}
            onChange={(e) => updateSetting("maxDate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Disabled days of week</Label>
        <div className="grid grid-cols-2 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={settings.disabledDays?.includes(day.value) || false}
                onCheckedChange={() => toggleDisabledDay(day.value)}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="text-sm font-normal"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
