"use client";

import { cn } from "@/lib/utils";
import type { QuestionRendererProps, OpinionScaleSettings } from "../types";

export function OpinionScale({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<number | null>) {
  const settings = question.settings as OpinionScaleSettings;

  const min = settings?.min ?? 1;
  const max = settings?.max ?? 5;
  const step = settings?.step ?? 1;

  const values: number[] = [];
  for (let i = min; i <= max; i += step) {
    values.push(i);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1">
        {values.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-medium transition-all",
              value === num
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/50 hover:bg-accent",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
      </div>

      {settings?.showLabels !== false && (
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{settings?.lowLabel || min}</span>
          {settings?.midLabel && <span>{settings.midLabel}</span>}
          <span>{settings?.highLabel || max}</span>
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
