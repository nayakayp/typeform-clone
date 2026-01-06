"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, LongTextSettings } from "../types";

export function LongText({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
}: QuestionRendererProps<string>) {
  const settings = question.settings as LongTextSettings;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = value?.trim().split(/\s+/).filter(Boolean).length || 0;

  // Auto-resize functionality
  useEffect(() => {
    if (settings?.autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, settings?.autoResize]);

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={settings?.placeholder || "Type your answer here..."}
        maxLength={settings?.maxLength}
        rows={settings?.rows || 4}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "min-h-[120px] resize-y text-base",
          settings?.autoResize && "resize-none overflow-hidden",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <div className="flex gap-4">
          {settings?.maxLength && (
            <span>
              {value?.length || 0} / {settings.maxLength} characters
            </span>
          )}
          {(settings?.minWords || settings?.maxWords) && (
            <span>
              {wordCount} {settings.maxWords ? `/ ${settings.maxWords}` : ""}{" "}
              words
            </span>
          )}
        </div>
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}
