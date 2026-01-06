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
import type { PhoneSettings } from "../types";

interface PhoneSettingsProps {
  settings: PhoneSettings;
  onChange: (settings: PhoneSettings) => void;
}

export function PhoneSettingsPanel({ settings, onChange }: PhoneSettingsProps) {
  const updateSetting = <K extends keyof PhoneSettings>(
    key: K,
    value: PhoneSettings[K]
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
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultCountry">Default country code</Label>
        <Input
          id="defaultCountry"
          value={settings.defaultCountry || ""}
          onChange={(e) => updateSetting("defaultCountry", e.target.value)}
          placeholder="US"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Phone format</Label>
        <Select
          value={settings.format || "international"}
          onValueChange={(value) =>
            updateSetting("format", value as "international" | "national")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="international">
              International (+1 555 123 4567)
            </SelectItem>
            <SelectItem value="national">National ((555) 123-4567)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
