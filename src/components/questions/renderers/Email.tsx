"use client";

import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, EmailSettings } from "../types";
import { getInputStyleClasses } from "../input-styles";

export function Email({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
}: QuestionRendererProps<string>) {
  const settings = question.settings as EmailSettings;

  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <Mail className="text-muted-foreground h-7 w-7 shrink-0" />
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={settings?.placeholder || "name@example.com"}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          className={cn(
            "ml-3",
            getInputStyleClasses(inputStyle, !!error)
          )}
        />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {settings?.domains && settings.domains.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Allowed domains: {settings.domains.join(", ")}
        </p>
      )}
    </div>
  );
}
