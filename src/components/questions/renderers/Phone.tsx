"use client";

import {
  PhoneInput,
  formatPhoneToE164,
  parseE164Phone,
  type PhoneInputValue,
} from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, PhoneSettings } from "../types";
import type { InputStyle } from "@/lib/theme/types";
import { useMemo } from "react";

/**
 * Get CSS classes for phone input based on inputStyle
 */
function getPhoneInputStyleClasses(
  inputStyle: InputStyle = "underline",
  hasError?: boolean
): {
  container: string;
  countryButton: string;
  input: string;
} {
  const baseInputClasses = "!text-2xl sm:!text-3xl transition-all duration-200";
  const errorClasses = hasError
    ? "border-destructive focus-visible:ring-destructive"
    : "";

  switch (inputStyle) {
    case "underline":
      return {
        container: "gap-0",
        countryButton: cn(
          "h-auto border-0 border-b-2 rounded-none bg-transparent px-2 shadow-none",
          "hover:bg-transparent hover:border-opacity-70",
          hasError ? "border-destructive" : ""
        ),
        input: cn(
          baseInputClasses,
          "!border-0 !border-b-2 !rounded-none !bg-transparent !px-2 !shadow-none",
          "focus-visible:!ring-0 focus-visible:!border-primary hover:!border-opacity-70",
          hasError ? "!border-destructive" : ""
        ),
      };
    case "borderless":
      return {
        container: "gap-0",
        countryButton: cn(
          "h-auto border-0 bg-transparent px-2 shadow-none",
          "hover:bg-transparent"
        ),
        input: cn(
          baseInputClasses,
          "!border-0 !bg-transparent !shadow-none focus-visible:!ring-0 !px-2",
          errorClasses
        ),
      };
    case "box":
    default:
      return {
        container: "",
        countryButton: "",
        input: cn(baseInputClasses, errorClasses),
      };
  }
}

export function Phone({
  question,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  inputStyle = "underline",
  primaryColor,
  themeColors,
}: QuestionRendererProps<string>) {
  const settings = question.settings as PhoneSettings;
  const styles = getPhoneInputStyleClasses(inputStyle, !!error);

  // Default country from settings or US
  const defaultCountry = (settings?.defaultCountry as string) || "US";

  // Parse string value to PhoneInputValue
  const phoneValue = useMemo(() => {
    return parseE164Phone(value || "", defaultCountry);
  }, [value, defaultCountry]);

  const handleChange = (newValue: PhoneInputValue) => {
    // Store as E.164 format string
    const e164 = formatPhoneToE164(newValue);
    onChange(e164);
  };

  return (
    <div className="space-y-2">
      <PhoneInput
        value={phoneValue}
        onChange={handleChange}
        defaultCountry={defaultCountry}
        placeholder={settings?.placeholder || "(201) 555-0123"}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn("w-full", styles.container)}
        countryButtonClassName={styles.countryButton}
        inputClassName={styles.input}
        primaryColor={primaryColor}
        themeColors={themeColors}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
