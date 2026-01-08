"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, NumberSettings } from "../types";
import { getInputStyleClasses } from "../input-styles";

export function Number({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
}: QuestionRendererProps<number | undefined>) {
  const settings = question.settings as NumberSettings;
  const step = settings?.step || 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(undefined);
      return;
    }
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const increment = () => {
    const current = value || 0;
    const newValue = current + step;
    if (settings?.max !== undefined && newValue > settings.max) return;
    onChange(newValue);
  };

  const decrement = () => {
    const current = value || 0;
    const newValue = current - step;
    if (settings?.min !== undefined && newValue < settings.min) return;
    onChange(newValue);
  };

  const formatValue = (val: number | undefined): string => {
    if (val === undefined) return "";
    if (settings?.decimalPlaces !== undefined) {
      return val.toFixed(settings.decimalPlaces);
    }
    return val.toString();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {settings?.prefix && (
          <span className="text-muted-foreground text-2xl sm:text-3xl">
            {settings.prefix}
          </span>
        )}
        <div className="relative flex-1">
          {settings?.showButtons && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-1 h-8 w-8 -translate-y-1/2"
              onClick={decrement}
              disabled={
                disabled ||
                (settings?.min !== undefined && (value || 0) <= settings.min)
              }
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          <Input
            type="number"
            value={formatValue(value)}
            onChange={handleChange}
            placeholder={settings?.placeholder || "0"}
            min={settings?.min}
            max={settings?.max}
            step={step}
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(
              "text-center",
              settings?.showButtons && "px-12",
              getInputStyleClasses(inputStyle, !!error)
            )}
          />
          {settings?.showButtons && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
              onClick={increment}
              disabled={
                disabled ||
                (settings?.max !== undefined && (value || 0) >= settings.max)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {settings?.suffix && (
          <span className="text-muted-foreground text-2xl sm:text-3xl">
            {settings.suffix}
          </span>
        )}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {(settings?.min !== undefined || settings?.max !== undefined) && (
        <p className="text-muted-foreground text-xs">
          {settings?.min !== undefined && settings?.max !== undefined
            ? `Between ${settings.min} and ${settings.max}`
            : settings?.min !== undefined
              ? `Minimum: ${settings.min}`
              : `Maximum: ${settings?.max}`}
        </p>
      )}
    </div>
  );
}
