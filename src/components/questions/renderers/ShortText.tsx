"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, ShortTextSettings } from "../types";
import { getInputStyleClasses } from "../input-styles";

export function ShortText({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
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
        className={cn(getInputStyleClasses(inputStyle, !!error))}
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
