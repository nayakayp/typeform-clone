"use client";

import { cn } from "@/lib/utils";
import type { QuestionRendererProps, NpsSettings } from "../types";

export function Nps({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<number | null>) {
  const settings = question.settings as NpsSettings;

  const getColorClass = (num: number) => {
    if (num <= 6) return "bg-red-500 hover:bg-red-600 text-white";
    if (num <= 8) return "bg-yellow-500 hover:bg-yellow-600 text-white";
    return "bg-green-500 hover:bg-green-600 text-white";
  };

  const getSelectedColorClass = (num: number) => {
    if (num <= 6) return "bg-red-600 ring-2 ring-red-600 ring-offset-2";
    if (num <= 8) return "bg-yellow-600 ring-2 ring-yellow-600 ring-offset-2";
    return "bg-green-600 ring-2 ring-green-600 ring-offset-2";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg text-lg font-medium transition-all",
              value === num ? getSelectedColorClass(num) : getColorClass(num),
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{settings?.lowLabel || "Not likely at all"}</span>
        <span>{settings?.highLabel || "Extremely likely"}</span>
      </div>

      {value !== null && value !== undefined && (
        <p className="text-muted-foreground text-sm">
          {value <= 6 ? "Detractor" : value <= 8 ? "Passive" : "Promoter"}
        </p>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
