"use client";

/**
 * BackgroundEditor Component
 * Background type selector (solid, gradient, image)
 */

import { useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Paintbrush, ImageIcon, Video, Droplet } from "lucide-react";
import type { ThemeBackground, BackgroundType } from "@/lib/theme/types";
import { GradientBuilder } from "./GradientBuilder";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface BackgroundEditorProps {
  background: ThemeBackground;
  onChange: (background: ThemeBackground) => void;
  className?: string;
}

// ============================================
// Background Type Icons
// ============================================

const BACKGROUND_TYPES: { type: BackgroundType; icon: React.ReactNode; label: string }[] = [
  { type: "solid", icon: <Droplet className="h-4 w-4" />, label: "Solid" },
  { type: "gradient", icon: <Paintbrush className="h-4 w-4" />, label: "Gradient" },
  { type: "image", icon: <ImageIcon className="h-4 w-4" />, label: "Image" },
  { type: "video", icon: <Video className="h-4 w-4" />, label: "Video" },
];

// ============================================
// Main Component
// ============================================

export function BackgroundEditor({
  background,
  onChange,
  className,
}: BackgroundEditorProps) {
  // Update background type
  const updateType = useCallback(
    (type: BackgroundType) => {
      if (type === background.type) return;

      // Set defaults for each type
      switch (type) {
        case "solid":
          onChange({
            type: "solid",
            color: background.color || "#FFFFFF",
          });
          break;
        case "gradient":
          onChange({
            type: "gradient",
            gradient: background.gradient || {
              type: "linear",
              angle: 135,
              stops: [
                { color: "#667eea", position: 0 },
                { color: "#764ba2", position: 100 },
              ],
            },
          });
          break;
        case "image":
          onChange({
            type: "image",
            image: background.image || {
              url: "",
              size: "cover",
              position: "center",
              repeat: "no-repeat",
            },
          });
          break;
        case "video":
          onChange({
            type: "video",
            video: background.video || {
              url: "",
              loop: true,
              muted: true,
            },
          });
          break;
      }
    },
    [background, onChange]
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Background Type Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Background Type</Label>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_TYPES.map(({ type, icon, label }) => (
            <Button
              key={type}
              variant={background.type === type ? "default" : "outline"}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => updateType(type)}
            >
              {icon}
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Solid Color Editor */}
      {background.type === "solid" && (
        <SolidColorEditor
          color={background.color || "#FFFFFF"}
          onChange={(color) => onChange({ ...background, color })}
        />
      )}

      {/* Gradient Editor */}
      {background.type === "gradient" && (
        <GradientBuilder
          gradient={background.gradient || {
            type: "linear",
            angle: 135,
            stops: [
              { color: "#667eea", position: 0 },
              { color: "#764ba2", position: 100 },
            ],
          }}
          onChange={(gradient) => onChange({ ...background, gradient })}
        />
      )}

      {/* Image Editor */}
      {background.type === "image" && (
        <ImageEditor
          image={background.image || {
            url: "",
            size: "cover",
            position: "center",
            repeat: "no-repeat",
          }}
          onChange={(image) => onChange({ ...background, image })}
        />
      )}

      {/* Video Editor */}
      {background.type === "video" && (
        <VideoEditor
          video={background.video || {
            url: "",
            loop: true,
            muted: true,
          }}
          onChange={(video) => onChange({ ...background, video })}
        />
      )}
    </div>
  );
}

// ============================================
// Solid Color Editor
// ============================================

interface SolidColorEditorProps {
  color: string;
  onChange: (color: string) => void;
}

function SolidColorEditor({ color, onChange }: SolidColorEditorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Solid Color</h3>

      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex h-32 w-full items-center justify-center rounded-lg border transition-colors hover:border-primary"
            style={{ backgroundColor: color }}
            type="button"
          >
            <span
              className="rounded-md bg-background/90 px-3 py-1 font-mono text-sm uppercase"
            >
              {color}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker color={color} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ============================================
// Image Editor
// ============================================

interface ImageEditorProps {
  image: NonNullable<ThemeBackground["image"]>;
  onChange: (image: NonNullable<ThemeBackground["image"]>) => void;
}

function ImageEditor({ image, onChange }: ImageEditorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Background Image</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={image.url}
            onChange={(e) => onChange({ ...image, url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL to an image. Supports JPG, PNG, WebP, and GIF.
          </p>
        </div>

        {image.url && (
          <div
            className="h-32 w-full rounded-lg border bg-cover bg-center"
            style={{ backgroundImage: `url(${image.url})` }}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Size</Label>
            <Select
              value={image.size}
              onValueChange={(value) =>
                onChange({ ...image, size: value as typeof image.size })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={image.position}
              onValueChange={(value) =>
                onChange({ ...image, position: value as typeof image.position })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select
              value={image.repeat}
              onValueChange={(value) =>
                onChange({ ...image, repeat: value as typeof image.repeat })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-repeat">No Repeat</SelectItem>
                <SelectItem value="repeat">Repeat</SelectItem>
                <SelectItem value="repeat-x">Repeat X</SelectItem>
                <SelectItem value="repeat-y">Repeat Y</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Overlay</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <div
                    className="mr-2 h-4 w-4 rounded border"
                    style={{ backgroundColor: image.overlay || "transparent" }}
                  />
                  {image.overlay || "None"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <HexColorPicker
                  color={image.overlay || "#000000"}
                  onChange={(color) => onChange({ ...image, overlay: color })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onChange({ ...image, overlay: undefined })}
                >
                  Remove Overlay
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Video Editor
// ============================================

interface VideoEditorProps {
  video: NonNullable<ThemeBackground["video"]>;
  onChange: (video: NonNullable<ThemeBackground["video"]>) => void;
}

function VideoEditor({ video, onChange }: VideoEditorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Background Video</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            type="url"
            placeholder="https://example.com/video.mp4"
            value={video.url}
            onChange={(e) => onChange({ ...video, url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL to an MP4, WebM, or OGG video file.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label>Loop</Label>
            <Switch
              checked={video.loop}
              onCheckedChange={(checked) => onChange({ ...video, loop: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Muted</Label>
            <Switch
              checked={video.muted}
              onCheckedChange={(checked) => onChange({ ...video, muted: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Overlay</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <div
                  className="mr-2 h-4 w-4 rounded border"
                  style={{ backgroundColor: video.overlay || "transparent" }}
                />
                {video.overlay || "None"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <HexColorPicker
                color={video.overlay || "#000000"}
                onChange={(color) => onChange({ ...video, overlay: color })}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onChange({ ...video, overlay: undefined })}
              >
                Remove Overlay
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default BackgroundEditor;
