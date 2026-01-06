"use client";

import { Input } from "@/components/ui/input";
import { Phone as PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, PhoneSettings } from "../types";

export function Phone({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
}: QuestionRendererProps<string>) {
  const settings = question.settings as PhoneSettings;

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
        <PhoneIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="tel"
          value={value || ""}
          onChange={handleChange}
          placeholder={settings?.placeholder || "+1 (555) 123-4567"}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 text-lg",
            error && "border-destructive focus-visible:ring-destructive"
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
