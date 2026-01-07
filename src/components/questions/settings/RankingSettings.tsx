"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { RankingSettings, ChoiceOption } from "../types";

interface RankingSettingsProps {
  settings: RankingSettings;
  onChange: (settings: RankingSettings) => void;
}

export function RankingSettingsPanel({
  settings,
  onChange,
}: RankingSettingsProps) {
  const updateSetting = <K extends keyof RankingSettings>(
    key: K,
    value: RankingSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const options = settings.options || [];

  const addOption = () => {
    const newOption: ChoiceOption = {
      id: `option_${Date.now()}`,
      label: `Item ${options.length + 1}`,
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
        <Label>Items to rank</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-4 w-4" />
              <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                {index + 1}
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
                disabled={options.length <= 2}
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
          Add item
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="randomize">Randomize initial order</Label>
        <Switch
          id="randomize"
          checked={settings.randomize || false}
          onCheckedChange={(checked) => updateSetting("randomize", checked)}
        />
      </div>
    </div>
  );
}
