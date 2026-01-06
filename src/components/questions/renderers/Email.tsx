"use client";

import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, EmailSettings } from "../types";

export function Email({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
}: QuestionRendererProps<string>) {
  const settings = question.settings as EmailSettings;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={settings?.placeholder || "name@example.com"}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          className={cn(
            "pl-10 text-lg",
            error && "border-destructive focus-visible:ring-destructive"
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
