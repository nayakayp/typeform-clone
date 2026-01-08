"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { QuestionRendererProps, YesNoSettings } from "../types";

export function YesNo({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<boolean | null>) {
  const settings = question.settings as YesNoSettings;

  const yesLabel = settings?.yesLabel || "Yes";
  const noLabel = settings?.noLabel || "No";

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button
          type="button"
          variant={value === true ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex-1 gap-3 text-2xl sm:text-3xl h-auto py-4",
            value === true && "ring-primary ring-2 ring-offset-2"
          )}
          onClick={() => onChange(true)}
          disabled={disabled}
        >
          <ThumbsUp className="h-6 w-6" />
          {yesLabel}
          <span className="bg-muted text-muted-foreground ml-auto rounded px-2 py-0.5 text-xs font-medium">
            Y
          </span>
        </Button>

        <Button
          type="button"
          variant={value === false ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex-1 gap-3 text-2xl sm:text-3xl h-auto py-4",
            value === false && "ring-primary ring-2 ring-offset-2"
          )}
          onClick={() => onChange(false)}
          disabled={disabled}
        >
          <ThumbsDown className="h-6 w-6" />
          {noLabel}
          <span className="bg-muted text-muted-foreground ml-auto rounded px-2 py-0.5 text-xs font-medium">
            N
          </span>
        </Button>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
