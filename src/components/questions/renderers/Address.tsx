"use client";

import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "../types";

interface AddressSettings {
  requireStreet?: boolean;
  requireCity?: boolean;
  requireState?: boolean;
  requirePostalCode?: boolean;
  requireCountry?: boolean;
  showStreet2?: boolean;
  defaultCountry?: string;
  allowedCountries?: string[];
}

interface AddressValue {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Common countries list
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
];

// US States
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

export function Address({
  question,
  value,
  onChange,
  disabled,
  error,
}: QuestionRendererProps<AddressValue | null>) {
  const settings = (question.settings || {}) as AddressSettings;

  const addressValue: AddressValue = value || {
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
    country: settings.defaultCountry || "US",
  };

  const handleChange = (field: keyof AddressValue, fieldValue: string) => {
    onChange({
      ...addressValue,
      [field]: fieldValue,
    });
  };

  const countries = settings.allowedCountries?.length
    ? COUNTRIES.filter((c) => settings.allowedCountries?.includes(c.code))
    : COUNTRIES;

  const showStates = addressValue.country === "US";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">Enter your address</span>
      </div>

      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="street1">
          Street address
          {settings.requireStreet && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          id="street1"
          placeholder="123 Main Street"
          value={addressValue.street1}
          onChange={(e) => handleChange("street1", e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Street Address Line 2 */}
      {settings.showStreet2 !== false && (
        <div className="space-y-2">
          <Label htmlFor="street2">
            Apartment, suite, etc.
            <span className="text-muted-foreground ml-1">(optional)</span>
          </Label>
          <Input
            id="street2"
            placeholder="Apt 4B"
            value={addressValue.street2 || ""}
            onChange={(e) => handleChange("street2", e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* City and State */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">
            City
            {settings.requireCity !== false && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id="city"
            placeholder="New York"
            value={addressValue.city}
            onChange={(e) => handleChange("city", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            {showStates ? "State" : "State / Province"}
            {settings.requireState !== false && <span className="text-destructive ml-1">*</span>}
          </Label>
          {showStates ? (
            <Select
              value={addressValue.state}
              onValueChange={(v) => handleChange("state", v)}
              disabled={disabled}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="state"
              placeholder="State or Province"
              value={addressValue.state}
              onChange={(e) => handleChange("state", e.target.value)}
              disabled={disabled}
            />
          )}
        </div>
      </div>

      {/* Postal Code and Country */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            {addressValue.country === "US" ? "ZIP code" : "Postal code"}
            {settings.requirePostalCode !== false && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id="postalCode"
            placeholder={addressValue.country === "US" ? "10001" : "Postal code"}
            value={addressValue.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">
            Country
            {settings.requireCountry !== false && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={addressValue.country}
            onValueChange={(v) => handleChange("country", v)}
            disabled={disabled}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
