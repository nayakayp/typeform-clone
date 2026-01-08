"use client";

import { Input } from "@/components/ui/input";
import { Phone as PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, PhoneSettings } from "../types";
import { getInputStyleClasses } from "../input-styles";

export function Phone({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
}: QuestionRendererProps<string>) {
  const settings = question.settings as PhoneSettings;
  const isUnderlineOrBorderless = inputStyle === "underline" || inputStyle === "borderless";

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, "");
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <PhoneIcon className={cn(
          "text-muted-foreground absolute top-1/2 h-4 w-4 -translate-y-1/2",
          isUnderlineOrBorderless ? "left-0" : "left-3"
        )} />
        <Input
          type="tel"
          value={value || ""}
          onChange={handleChange}
          placeholder={settings?.placeholder || "+1 (555) 123-4567"}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            isUnderlineOrBorderless ? "pl-6" : "pl-10",
            getInputStyleClasses(inputStyle, !!error)
          )}
        />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <p className="text-muted-foreground text-xs">
        Include country code (e.g., +1 for US)
      </p>
    </div>
  );
}
