"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  countries,
  getCountryByCode,
  getDefaultCountry,
  type Country,
} from "@/lib/countries";

export interface PhoneInputValue {
  countryCode: string;
  dialCode: string;
  phoneNumber: string;
}

export interface PhoneInputProps {
  value?: PhoneInputValue;
  onChange?: (value: PhoneInputValue) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  /** Custom class for the country select button */
  countryButtonClassName?: string;
  /** Custom class for the phone number input */
  inputClassName?: string;
  /** Primary color for theming (used for borders, accents) */
  primaryColor?: string;
  /** Theme colors for comprehensive theming */
  themeColors?: {
    primary?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    mutedForeground?: string;
    border?: string;
    input?: string;
  };
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "US",
  placeholder = "(201) 555-0123",
  disabled,
  autoFocus,
  className,
  countryButtonClassName,
  inputClassName,
  primaryColor = "#5EEAD4", // Teal default to match design
  themeColors,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Resolve theme colors with fallbacks
  const colors = {
    primary: themeColors?.primary || primaryColor,
    background: themeColors?.background || "#ffffff",
    foreground: themeColors?.foreground || "#1a1a1a",
    muted: themeColors?.muted || "#f5f5f5",
    mutedForeground: themeColors?.mutedForeground || "#737373",
    border: themeColors?.border || "#e5e5e5",
    input: themeColors?.input || "#ffffff",
  };

  // Initialize with default country
  const selectedCountry = React.useMemo(() => {
    if (value?.countryCode) {
      return getCountryByCode(value.countryCode) || getDefaultCountry();
    }
    return getCountryByCode(defaultCountry) || getDefaultCountry();
  }, [value?.countryCode, defaultCountry]);

  // Filter countries based on search
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) || c.dialCode.includes(searchQuery)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: Country) => {
    onChange?.({
      countryCode: country.code,
      dialCode: country.dialCode,
      phoneNumber: value?.phoneNumber || "",
    });
    setIsOpen(false);
    setSearchQuery("");
    // Focus the input after selection
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, dashes, and parentheses
    const cleaned = e.target.value.replace(/[^\d\s\-()]/g, "");
    onChange?.({
      countryCode: selectedCountry.code,
      dialCode: selectedCountry.dialCode,
      phoneNumber: cleaned,
    });
  };

  return (
    <div className={cn("flex w-full", className)}>
      {/* Country Selector */}
      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex items-center gap-1 border-b-2 px-2 transition-colors",
              "hover:border-opacity-70 focus:outline-none",
              disabled && "cursor-not-allowed opacity-50",
              countryButtonClassName
            )}
            style={{ borderColor: colors.primary }}
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <ChevronDown
              className="h-4 w-4 opacity-60"
              style={{ color: colors.primary }}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[350px] overflow-hidden p-0"
          style={{
            borderColor: colors.primary,
            borderWidth: "2px",
            borderRadius: "12px",
            backgroundColor: colors.background,
          }}
          align="start"
        >
          {/* Search Input */}
          <div
            className="px-4 py-3"
            style={{
              backgroundColor: colors.background,
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries"
              className="w-full bg-transparent text-xl outline-none"
              style={{ color: colors.foreground }}
              autoFocus
            />
          </div>

          {/* Country List */}
          <ScrollArea
            className="h-[310px]"
            style={{ backgroundColor: colors.background }}
          >
            <div className="space-y-1 p-2">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-colors"
                  )}
                  style={{
                    backgroundColor: colors.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.muted;
                  }}
                >
                  {/* Flag */}
                  <span className="shrink-0 text-2xl">{country.flag}</span>
                  {/* Country Name */}
                  <span
                    className="flex-1 text-left text-lg font-medium"
                    style={{ color: colors.foreground }}
                  >
                    {country.name}
                  </span>
                  {/* Dial Code */}
                  <span
                    className="text-lg"
                    style={{ color: colors.mutedForeground }}
                  >
                    {country.dialCode}
                  </span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div
                  className="py-4 text-center text-lg"
                  style={{ color: colors.mutedForeground }}
                >
                  No countries found
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <Input
        ref={inputRef}
        type="tel"
        value={value?.phoneNumber || ""}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn("ml-2 flex-1", inputClassName)}
      />
    </div>
  );
}

/**
 * Format phone value to E.164 format for storage
 * Returns dial code even if no phone number is entered (to preserve country selection)
 */
export function formatPhoneToE164(value: PhoneInputValue): string {
  // Remove all non-digits from phone number
  const digits = value.phoneNumber.replace(/\D/g, "");
  // Always include dial code to preserve country selection
  return `${value.dialCode}${digits}`;
}

/**
 * Parse E.164 phone string to PhoneInputValue
 */
export function parseE164Phone(
  phone: string,
  defaultCountry = "US"
): PhoneInputValue {
  if (!phone) {
    const country = getCountryByCode(defaultCountry) || getDefaultCountry();
    return {
      countryCode: country.code,
      dialCode: country.dialCode,
      phoneNumber: "",
    };
  }

  // Try to match country by dial code
  for (const country of countries) {
    if (phone.startsWith(country.dialCode)) {
      return {
        countryCode: country.code,
        dialCode: country.dialCode,
        phoneNumber: phone.slice(country.dialCode.length),
      };
    }
  }

  // Fallback to default country
  const country = getCountryByCode(defaultCountry) || getDefaultCountry();
  return {
    countryCode: country.code,
    dialCode: country.dialCode,
    phoneNumber: phone.replace(/^\+/, ""),
  };
}
