"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, DateSettings } from "../types";

export function DatePicker({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<Date | undefined>) {
  const settings = question.settings as DateSettings;
  const [open, setOpen] = useState(false);

  const minDate = settings?.minDate ? new Date(settings.minDate) : undefined;
  const maxDate = settings?.maxDate ? new Date(settings.maxDate) : undefined;

  const disabledDates = (date: Date) => {
    // Check min/max date
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;

    // Check disabled days of week
    if (settings?.disabledDays?.includes(date.getDay())) return true;

    // Check specific disabled dates
    if (settings?.disabledDates) {
      const dateStr = date.toISOString().split("T")[0];
      if (settings.disabledDates.includes(dateStr)) return true;
    }

    return false;
  };

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  const formatStr = settings?.format || "PPP";

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left text-lg font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, formatStr)
            ) : (
              <span>{settings?.placeholder || "Pick a date"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledDates}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
