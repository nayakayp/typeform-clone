"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { DropdownSettings, ChoiceOption } from "../types";

interface DropdownSettingsProps {
  settings: DropdownSettings;
  onChange: (settings: DropdownSettings) => void;
}

export function DropdownSettingsPanel({
  settings,
  onChange,
}: DropdownSettingsProps) {
  const updateSetting = <K extends keyof DropdownSettings>(
    key: K,
    value: DropdownSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const options = settings.options || [];

  const addOption = () => {
    const newOption: ChoiceOption = {
      id: `option_${Date.now()}`,
      label: `Option ${options.length + 1}`,
      order: options.length,
    };
    updateSetting("options", [...options, newOption]);
  };

  const updateOption = (id: string, label: string) => {
    updateSetting(
      "options",
      options.map((opt) => (opt.id === id ? { ...opt, label } : opt))
    );
  };

  const removeOption = (id: string) => {
    updateSetting(
      "options",
      options.filter((opt) => opt.id !== id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder text</Label>
        <Input
          id="placeholder"
          value={settings.placeholder || ""}
          onChange={(e) => updateSetting("placeholder", e.target.value)}
          placeholder="Select an option..."
        />
      </div>

      <div className="space-y-2">
        <Label>Options</Label>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-4 w-4" />
              <Input
                value={option.label}
                onChange={(e) => updateOption(option.id, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add option
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="searchable">Enable search</Label>
        <Switch
          id="searchable"
          checked={settings.searchable || false}
          onCheckedChange={(checked) => updateSetting("searchable", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="alphabetize">Alphabetize options</Label>
        <Switch
          id="alphabetize"
          checked={settings.alphabetize || false}
          onCheckedChange={(checked) => updateSetting("alphabetize", checked)}
        />
      </div>
    </div>
  );
}
