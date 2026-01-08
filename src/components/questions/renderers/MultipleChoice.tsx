"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import type { QuestionRendererProps, MultipleChoiceSettings } from "../types";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MultipleChoice({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<string>) {
  const settings = question.settings as MultipleChoiceSettings;
  const [otherValue, setOtherValue] = useState("");

  const options = useMemo(() => {
    const opts = settings?.options || [];
    return settings?.randomize ? shuffleArray(opts) : opts;
  }, [settings?.options, settings?.randomize]);

  const layout = settings?.layout || "vertical";

  const handleChange = (newValue: string) => {
    if (newValue === "__other__") {
      onChange(otherValue ? `__other__:${otherValue}` : "__other__:");
    } else {
      onChange(newValue);
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherValue(text);
    onChange(`__other__:${text}`);
  };

  const isOtherSelected = value?.startsWith("__other__:");

  return (
    <div className="space-y-3">
      <RadioGroup
        value={isOtherSelected ? "__other__" : value || ""}
        onValueChange={handleChange}
        disabled={disabled}
        className={cn(
          layout === "horizontal" && "flex flex-wrap gap-3",
          layout === "grid" && `grid gap-3 grid-cols-${settings?.columns || 2}`,
          layout === "vertical" && "space-y-2"
        )}
      >
        {options.map((option, index) => (
          <div
            key={option.id}
            className={cn(
              "hover:bg-accent flex items-center space-x-3 rounded-lg border p-4 transition-colors",
              value === option.id && "border-primary bg-primary/5"
            )}
          >
            <RadioGroupItem value={option.id} id={option.id} className="h-5 w-5" />
            <Label
              htmlFor={option.id}
              className="flex flex-1 cursor-pointer items-center gap-3 text-2xl sm:text-3xl"
            >
              <span className="bg-muted flex h-8 w-8 items-center justify-center rounded text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.label}</span>
            </Label>
          </div>
        ))}

        {settings?.allowOther && (
          <div
            className={cn(
              "hover:bg-accent flex items-center space-x-3 rounded-lg border p-4 transition-colors",
              isOtherSelected && "border-primary bg-primary/5"
            )}
          >
            <RadioGroupItem value="__other__" id="__other__" className="h-5 w-5" />
            <Label
              htmlFor="__other__"
              className="flex flex-1 cursor-pointer items-center gap-3 text-2xl sm:text-3xl"
            >
              <span className="bg-muted flex h-8 w-8 items-center justify-center rounded text-sm font-medium">
                {String.fromCharCode(65 + options.length)}
              </span>
              <span>Other</span>
            </Label>
          </div>
        )}
      </RadioGroup>

      {settings?.allowOther && isOtherSelected && (
        <Input
          value={otherValue}
          onChange={(e) => handleOtherChange(e.target.value)}
          placeholder="Please specify..."
          className="ml-11"
          autoFocus
        />
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
