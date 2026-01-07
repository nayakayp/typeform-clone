"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import type { PictureChoiceSettings, ChoiceOption } from "../types";

interface PictureChoiceSettingsProps {
  settings: PictureChoiceSettings;
  onChange: (settings: PictureChoiceSettings) => void;
}

export function PictureChoiceSettingsPanel({
  settings,
  onChange,
}: PictureChoiceSettingsProps) {
  const updateSetting = <K extends keyof PictureChoiceSettings>(
    key: K,
    value: PictureChoiceSettings[K]
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

  const updateOption = (
    id: string,
    field: "label" | "image",
    value: string
  ) => {
    updateSetting(
      "options",
      options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
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
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-muted-foreground h-4 w-4" />
                <Input
                  value={option.label}
                  onChange={(e) =>
                    updateOption(option.id, "label", e.target.value)
                  }
                  placeholder="Label"
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
              <Input
                value={option.image || ""}
                onChange={(e) =>
                  updateOption(option.id, "image", e.target.value)
                }
                placeholder="Image URL"
              />
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

      <div className="space-y-2">
        <Label>Columns</Label>
        <Select
          value={String(settings.columns || 3)}
          onValueChange={(value) => updateSetting("columns", parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 columns</SelectItem>
            <SelectItem value="3">3 columns</SelectItem>
            <SelectItem value="4">4 columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="multipleSelection">Allow multiple selections</Label>
        <Switch
          id="multipleSelection"
          checked={settings.multipleSelection || false}
          onCheckedChange={(checked) =>
            updateSetting("multipleSelection", checked)
          }
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

      <div className="flex items-center justify-between">
        <Label htmlFor="supersize">Supersize images</Label>
        <Switch
          id="supersize"
          checked={settings.supersize || false}
          onCheckedChange={(checked) => updateSetting("supersize", checked)}
        />
      </div>
    </div>
  );
}
