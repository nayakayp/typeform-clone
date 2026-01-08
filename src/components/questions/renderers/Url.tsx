"use client";

import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, UrlSettings } from "../types";
import { getInputStyleClasses } from "../input-styles";

export function Url({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
}: QuestionRendererProps<string>) {
  const settings = question.settings as UrlSettings;
  const isUnderlineOrBorderless = inputStyle === "underline" || inputStyle === "borderless";

  const handleBlur = () => {
    if (
      value &&
      !value.startsWith("http://") &&
      !value.startsWith("https://")
    ) {
      onChange(`https://${value}`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Link className={cn(
          "text-muted-foreground absolute top-1/2 h-4 w-4 -translate-y-1/2",
          isUnderlineOrBorderless ? "left-0" : "left-3"
        )} />
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={settings?.placeholder || "https://example.com"}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            isUnderlineOrBorderless ? "pl-6" : "pl-10",
            getInputStyleClasses(inputStyle, !!error)
          )}
        />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {settings?.requireHttps && (
        <p className="text-muted-foreground text-xs">HTTPS required</p>
      )}
    </div>
  );
}
