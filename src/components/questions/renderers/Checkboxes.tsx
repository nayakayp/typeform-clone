"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import type { QuestionRendererProps, CheckboxesSettings } from "../types";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Checkboxes({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<string[]>) {
  const settings = question.settings as CheckboxesSettings;
  const [otherValue, setOtherValue] = useState("");

  const options = useMemo(() => {
    const opts = settings?.options || [];
    return settings?.randomize ? shuffleArray(opts) : opts;
  }, [settings?.options, settings?.randomize]);

  const selectedValues = value || [];

  const handleToggle = (optionId: string, checked: boolean) => {
    let newValues: string[];

    if (checked) {
      if (
        settings?.maxSelections &&
        selectedValues.length >= settings.maxSelections
      ) {
        return;
      }
      newValues = [...selectedValues, optionId];
    } else {
      newValues = selectedValues.filter((v) => v !== optionId);
    }

    onChange(newValues);
  };

  const handleOtherToggle = (checked: boolean) => {
    if (checked) {
      if (
        settings?.maxSelections &&
        selectedValues.length >= settings.maxSelections
      ) {
        return;
      }
      onChange([...selectedValues, `__other__:${otherValue}`]);
    } else {
      onChange(selectedValues.filter((v) => !v.startsWith("__other__:")));
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherValue(text);
    const otherIndex = selectedValues.findIndex((v) =>
      v.startsWith("__other__:")
    );
    if (otherIndex >= 0) {
      const newValues = [...selectedValues];
      newValues[otherIndex] = `__other__:${text}`;
      onChange(newValues);
    }
  };

  const isOtherSelected = selectedValues.some((v) =>
    v.startsWith("__other__:")
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((option, index) => {
          const isChecked = selectedValues.includes(option.id);
          return (
            <div
              key={option.id}
              className={cn(
                "hover:bg-accent flex items-center space-x-3 rounded-lg border p-3 transition-colors",
                isChecked && "border-primary bg-primary/5"
              )}
            >
              <Checkbox
                id={option.id}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleToggle(option.id, checked as boolean)
                }
                disabled={disabled}
              />
              <Label
                htmlFor={option.id}
                className="flex flex-1 cursor-pointer items-center gap-2"
              >
                <span className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option.label}</span>
              </Label>
            </div>
          );
        })}

        {settings?.allowOther && (
          <div
            className={cn(
              "hover:bg-accent flex items-center space-x-3 rounded-lg border p-3 transition-colors",
              isOtherSelected && "border-primary bg-primary/5"
            )}
          >
            <Checkbox
              id="__other__"
              checked={isOtherSelected}
              onCheckedChange={(checked) =>
                handleOtherToggle(checked as boolean)
              }
              disabled={disabled}
            />
            <Label
              htmlFor="__other__"
              className="flex flex-1 cursor-pointer items-center gap-2"
            >
              <span className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
                {String.fromCharCode(65 + options.length)}
              </span>
              <span>Other</span>
            </Label>
          </div>
        )}
      </div>

      {settings?.allowOther && isOtherSelected && (
        <Input
          value={otherValue}
          onChange={(e) => handleOtherChange(e.target.value)}
          placeholder="Please specify..."
          className="ml-11"
          autoFocus
        />
      )}

      {(settings?.minSelections || settings?.maxSelections) && (
        <p className="text-muted-foreground text-xs">
          {settings.minSelections && settings.maxSelections
            ? `Select ${settings.minSelections} to ${settings.maxSelections} options`
            : settings.minSelections
              ? `Select at least ${settings.minSelections} options`
              : `Select up to ${settings.maxSelections} options`}
        </p>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
