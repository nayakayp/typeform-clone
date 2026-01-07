"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { CheckboxesSettings, ChoiceOption } from "../types";

interface CheckboxesSettingsProps {
  settings: CheckboxesSettings;
  onChange: (settings: CheckboxesSettings) => void;
}

export function CheckboxesSettingsPanel({
  settings,
  onChange,
}: CheckboxesSettingsProps) {
  const updateSetting = <K extends keyof CheckboxesSettings>(
    key: K,
    value: CheckboxesSettings[K]
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
        <Label>Options</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-4 w-4" />
              <span className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minSelections">Min selections</Label>
          <Input
            id="minSelections"
            type="number"
            min={0}
            value={settings.minSelections || ""}
            onChange={(e) =>
              updateSetting(
                "minSelections",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSelections">Max selections</Label>
          <Input
            id="maxSelections"
            type="number"
            min={1}
            value={settings.maxSelections || ""}
            onChange={(e) =>
              updateSetting(
                "maxSelections",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="allowOther">Allow &quot;Other&quot; option</Label>
        <Switch
          id="allowOther"
          checked={settings.allowOther || false}
          onCheckedChange={(checked) => updateSetting("allowOther", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="randomize">Randomize order</Label>
        <Switch
          id="randomize"
          checked={settings.randomize || false}
          onCheckedChange={(checked) => updateSetting("randomize", checked)}
        />
      </div>
    </div>
  );
}
