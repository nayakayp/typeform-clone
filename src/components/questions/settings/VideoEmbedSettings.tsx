"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { VideoEmbedSettings } from "../types";

interface VideoEmbedSettingsPanelProps {
  question: Question;
  onUpdate: (settings: QuestionSettings) => void;
}

export function VideoEmbedSettingsPanel({
  question,
  onUpdate,
}: VideoEmbedSettingsPanelProps) {
  const settings = (question.settings || {}) as VideoEmbedSettings;

  const updateSetting = <K extends keyof VideoEmbedSettings>(
    key: K,
    value: VideoEmbedSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="url">Video URL</Label>
        <Input
          id="url"
          type="url"
          value={settings.url || ""}
          onChange={(e) => updateSetting("url", e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          Supports YouTube, Vimeo, Wistia, Loom, and direct video URLs
        </p>
      </div>

      {/* Provider */}
      <div className="space-y-2">
        <Label>Video Provider</Label>
        <Select
          value={settings.provider || "youtube"}
          onValueChange={(
            value: "youtube" | "vimeo" | "wistia" | "loom" | "custom"
          ) => updateSetting("provider", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="vimeo">Vimeo</SelectItem>
            <SelectItem value="wistia">Wistia</SelectItem>
            <SelectItem value="loom">Loom</SelectItem>
            <SelectItem value="custom">Custom/Direct URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Autoplay */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Autoplay</Label>
          <p className="text-xs text-muted-foreground">
            Start playing automatically (will be muted)
          </p>
        </div>
        <Switch
          checked={settings.autoplay || false}
          onCheckedChange={(checked) => updateSetting("autoplay", checked)}
        />
      </div>

      {/* Show controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Show Controls</Label>
          <p className="text-xs text-muted-foreground">
            Display video player controls
          </p>
        </div>
        <Switch
          checked={settings.showControls ?? true}
          onCheckedChange={(checked) => updateSetting("showControls", checked)}
        />
      </div>

      {/* Loop */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Loop</Label>
          <p className="text-xs text-muted-foreground">
            Repeat the video continuously
          </p>
        </div>
        <Switch
          checked={settings.loop || false}
          onCheckedChange={(checked) => updateSetting("loop", checked)}
        />
      </div>

      {/* Muted */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Muted</Label>
          <p className="text-xs text-muted-foreground">Start with sound off</p>
        </div>
        <Switch
          checked={settings.muted || false}
          onCheckedChange={(checked) => updateSetting("muted", checked)}
        />
      </div>

      {/* Required watch time */}
      <div className="space-y-2">
        <Label htmlFor="requiredWatchTime">Required Watch Time (seconds)</Label>
        <Input
          id="requiredWatchTime"
          type="number"
          min={0}
          value={settings.requiredWatchTime || ""}
          onChange={(e) =>
            updateSetting(
              "requiredWatchTime",
              parseInt(e.target.value) || undefined
            )
          }
          placeholder="Optional - leave empty for no requirement"
        />
        <p className="text-xs text-muted-foreground">
          Require respondents to watch for this many seconds before continuing
        </p>
      </div>
    </div>
  );
}
