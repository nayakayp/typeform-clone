"use client";

import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, TimeSettings } from "../types";

export function Time({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
}: QuestionRendererProps<string>) {
  const settings = question.settings as TimeSettings;

  // Generate time options for dropdown if using 12h format
  const generateTimeOptions = () => {
    const options: string[] = [];
    const step = settings?.minuteStep || 15;

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const h = hour.toString().padStart(2, "0");
        const m = minute.toString().padStart(2, "0");
        options.push(`${h}:${m}`);
      }
    }
    return options;
  };

  const formatTo12Hour = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          min={settings?.minTime}
          max={settings?.maxTime}
          step={settings?.minuteStep ? settings.minuteStep * 60 : undefined}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 text-lg",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {settings?.format === "12h" && value && (
        <p className="text-muted-foreground text-xs">{formatTo12Hour(value)}</p>
      )}
    </div>
  );
}
