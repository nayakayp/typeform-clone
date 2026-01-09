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
      <div className="relative flex items-center">
        <Link className="text-muted-foreground h-7 w-7 shrink-0" />
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={settings?.placeholder || "https://example.com"}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "ml-3",
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
