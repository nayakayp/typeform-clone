"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Heart, ThumbsUp } from "lucide-react";
import type { RatingSettings } from "../types";

interface RatingSettingsProps {
  settings: RatingSettings;
  onChange: (settings: RatingSettings) => void;
}

export function RatingSettingsPanel({
  settings,
  onChange,
}: RatingSettingsProps) {
  const updateSetting = <K extends keyof RatingSettings>(
    key: K,
    value: RatingSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="maxRating">Maximum rating</Label>
        <Input
          id="maxRating"
          type="number"
          min={3}
          max={10}
          value={settings.maxRating || 5}
          onChange={(e) =>
            updateSetting("maxRating", parseInt(e.target.value) || 5)
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Icon style</Label>
        <Select
          value={settings.icon || "star"}
          onValueChange={(value) =>
            updateSetting("icon", value as "star" | "heart" | "thumbs")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="star">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Stars</span>
              </div>
            </SelectItem>
            <SelectItem value="heart">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Hearts</span>
              </div>
            </SelectItem>
            <SelectItem value="thumbs">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>Thumbs up</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lowLabel">Low rating label</Label>
        <Input
          id="lowLabel"
          value={settings.lowLabel || ""}
          onChange={(e) => updateSetting("lowLabel", e.target.value)}
          placeholder="Poor"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highLabel">High rating label</Label>
        <Input
          id="highLabel"
          value={settings.highLabel || ""}
          onChange={(e) => updateSetting("highLabel", e.target.value)}
          placeholder="Excellent"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showNumbers">Show numbers on icons</Label>
        <Switch
          id="showNumbers"
          checked={settings.showNumbers || false}
          onCheckedChange={(checked) => updateSetting("showNumbers", checked)}
        />
      </div>
    </div>
  );
}
