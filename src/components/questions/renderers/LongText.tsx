"use client";

import { useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, LongTextSettings } from "../types";
import { getTextareaStyleClasses } from "../input-styles";

export function LongText({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
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

  // Handle Enter key: Shift+Enter = line break, Enter = go to next question
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          // Shift+Enter: allow default behavior (insert line break)
          return;
        }
        // Enter without Shift: prevent default and let event bubble up to trigger navigation
        e.preventDefault();
      }
    },
    []
  );

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={settings?.placeholder || "Type your answer here..."}
        maxLength={settings?.maxLength}
        rows={settings?.rows || 4}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "min-h-[100%] resize-y",
          settings?.autoResize && "resize-none overflow-hidden",
          getTextareaStyleClasses(inputStyle, !!error)
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
