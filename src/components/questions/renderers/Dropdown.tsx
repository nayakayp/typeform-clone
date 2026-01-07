"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps, DropdownSettings } from "../types";

export function Dropdown({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<string>) {
  const settings = question.settings as DropdownSettings;
  const options = settings?.options || [];

  return (
    <div className="space-y-2">
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "w-full text-lg",
            error && "border-destructive focus:ring-destructive"
          )}
        >
          <SelectValue
            placeholder={settings?.placeholder || "Select an option..."}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
