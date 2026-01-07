"use client";

/**
 * GradientBuilder Component
 * Create gradients with customizable stops
 */

import { useState, useCallback, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RotateCw } from "lucide-react";
import type { GradientConfig, GradientStop } from "@/lib/theme/types";
import { GRADIENT_PRESETS } from "@/lib/theme/defaults";
import { gradientToCSS } from "@/lib/theme/utils";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface GradientBuilderProps {
  gradient: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
  className?: string;
}

// ============================================
// Main Component
// ============================================

export function GradientBuilder({
  gradient,
  onChange,
  className,
}: GradientBuilderProps) {
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  // Generate CSS gradient string
  const gradientCSS = useMemo(() => gradientToCSS(gradient), [gradient]);

  // Update gradient type
  const updateType = useCallback(
    (type: "linear" | "radial") => {
      onChange({ ...gradient, type });
    },
    [gradient, onChange]
  );

  // Update gradient angle
  const updateAngle = useCallback(
    (angle: number) => {
      onChange({ ...gradient, angle });
    },
    [gradient, onChange]
  );

  // Update a specific stop
  const updateStop = useCallback(
    (index: number, updates: Partial<GradientStop>) => {
      const newStops = [...gradient.stops];
      newStops[index] = { ...newStops[index], ...updates };
      // Sort by position
      newStops.sort((a, b) => a.position - b.position);
      onChange({ ...gradient, stops: newStops });
    },
    [gradient, onChange]
  );

  // Add a new stop
  const addStop = useCallback(() => {
    if (gradient.stops.length >= 5) return;

    // Find a good position for the new stop
    const positions = gradient.stops.map((s) => s.position);
    let newPosition = 50;

    // Find the largest gap
    for (let i = 0; i < positions.length - 1; i++) {
      const gap = positions[i + 1] - positions[i];
      if (gap > 20) {
        newPosition = positions[i] + gap / 2;
        break;
      }
    }

    const newStops = [
      ...gradient.stops,
      { color: "#808080", position: newPosition },
    ].sort((a, b) => a.position - b.position);

    onChange({ ...gradient, stops: newStops });
    setSelectedStopIndex(newStops.findIndex((s) => s.position === newPosition));
  }, [gradient, onChange]);

  // Remove a stop
  const removeStop = useCallback(
    (index: number) => {
      if (gradient.stops.length <= 2) return;

      const newStops = gradient.stops.filter((_, i) => i !== index);
      onChange({ ...gradient, stops: newStops });

      if (selectedStopIndex >= newStops.length) {
        setSelectedStopIndex(newStops.length - 1);
      }
    },
    [gradient, onChange, selectedStopIndex]
  );

  // Apply preset
  const applyPreset = useCallback(
    (preset: GradientConfig) => {
      onChange(preset);
      setSelectedStopIndex(0);
    },
    [onChange]
  );

  const selectedStop = gradient.stops[selectedStopIndex];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Gradient Preview */}
      <div className="space-y-3">
        <Label>Preview</Label>
        <div
          className="h-32 w-full rounded-lg border shadow-inner"
          style={{ background: gradientCSS }}
        />
      </div>

      {/* Preset Gradients */}
      <div className="space-y-3">
        <Label>Presets</Label>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyPreset(preset.gradient)}
              className="group relative h-12 overflow-hidden rounded-md border transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2"
              style={{ background: gradientToCSS(preset.gradient) }}
              title={preset.name}
            >
              <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gradient Type */}
      <div className="space-y-3">
        <Label>Type</Label>
        <div className="flex gap-2">
          <Button
            variant={gradient.type === "linear" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => updateType("linear")}
          >
            Linear
          </Button>
          <Button
            variant={gradient.type === "radial" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => updateType("radial")}
          >
            Radial
          </Button>
        </div>
      </div>

      {/* Angle (for linear gradients) */}
      {gradient.type === "linear" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Angle</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={360}
                value={gradient.angle}
                onChange={(e) => updateAngle(parseInt(e.target.value) || 0)}
                className="h-8 w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">deg</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[gradient.angle]}
              min={0}
              max={360}
              step={15}
              onValueChange={([value]) => updateAngle(value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateAngle((gradient.angle + 45) % 360)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick angle presets */}
          <div className="flex justify-center gap-1">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => updateAngle(angle)}
                className={cn(
                  "h-6 w-6 rounded text-xs transition-colors",
                  gradient.angle === angle
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {angle}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Color Stops</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addStop}
            disabled={gradient.stops.length >= 5}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Stop
          </Button>
        </div>

        {/* Stops visualization */}
        <div className="relative">
          <div
            className="h-6 w-full rounded-md"
            style={{ background: gradientCSS }}
          />
          <div className="absolute inset-0 flex items-center">
            {gradient.stops.map((stop, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedStopIndex(index)}
                className={cn(
                  "absolute h-6 w-3 -translate-x-1/2 rounded-sm border-2 shadow-sm transition-all",
                  selectedStopIndex === index
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-white"
                )}
                style={{
                  left: `${stop.position}%`,
                  backgroundColor: stop.color,
                }}
              />
            ))}
          </div>
        </div>

        {/* Stop list */}
        <div className="space-y-2">
          {gradient.stops.map((stop, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 rounded-md border p-2 transition-colors",
                selectedStopIndex === index && "border-primary bg-muted/50"
              )}
              onClick={() => setSelectedStopIndex(index)}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md border shadow-sm"
                    style={{ backgroundColor: stop.color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <HexColorPicker
                    color={stop.color}
                    onChange={(color) => updateStop(index, { color })}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase">
                    {stop.color}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    at {stop.position}%
                  </span>
                </div>
                <Slider
                  value={[stop.position]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([position]) => updateStop(index, { position })}
                  className="mt-1"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeStop(index);
                }}
                disabled={gradient.stops.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Stop Editor */}
      {selectedStop && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <Label className="text-xs font-medium uppercase text-muted-foreground">
            Selected Stop ({selectedStopIndex + 1} of {gradient.stops.length})
          </Label>

          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-16 w-16 rounded-lg border shadow-sm"
                  style={{ backgroundColor: selectedStop.color }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <HexColorPicker
                  color={selectedStop.color}
                  onChange={(color) => updateStop(selectedStopIndex, { color })}
                />
              </PopoverContent>
            </Popover>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Color</Label>
                <Input
                  value={selectedStop.color}
                  onChange={(e) =>
                    updateStop(selectedStopIndex, { color: e.target.value })
                  }
                  className="h-8 w-24 font-mono text-xs uppercase"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Position</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={selectedStop.position}
                    onChange={(e) =>
                      updateStop(selectedStopIndex, {
                        position: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-8 w-16 text-center"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradientBuilder;
