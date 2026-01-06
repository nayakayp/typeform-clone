"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, ShortTextSettings } from "../types";

export function ShortText({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
}: QuestionRendererProps<string>) {
  const settings = question.settings as ShortTextSettings;

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={settings?.placeholder || "Type your answer here..."}
        maxLength={settings?.maxLength}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "text-lg",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        {settings?.maxLength && (
          <span>
            {value?.length || 0} / {settings.maxLength}
          </span>
        )}
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}
