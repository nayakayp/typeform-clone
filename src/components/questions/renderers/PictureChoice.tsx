"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, ImageIcon } from "lucide-react";
import type { QuestionRendererProps, PictureChoiceSettings } from "../types";

export function PictureChoice({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<string | string[]>) {
  const settings = question.settings as PictureChoiceSettings;
  const options = settings?.options || [];
  const multipleSelection = settings?.multipleSelection ?? false;
  const showLabels = settings?.showLabels ?? true;
  const columns = settings?.columns ?? 3;

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const handleSelect = (optionId: string) => {
    if (multipleSelection) {
      const newValues = selectedValues.includes(optionId)
        ? selectedValues.filter((v) => v !== optionId)
        : [...selectedValues, optionId];
      onChange(newValues as string & string[]);
    } else {
      onChange(optionId as string & string[]);
    }
  };

  const isSelected = (optionId: string) => selectedValues.includes(optionId);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "grid gap-4",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}
      >
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
              isSelected(option.id)
                ? "border-primary ring-primary ring-2 ring-offset-2"
                : "border-border hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => handleSelect(option.id)}
          >
            {option.image ? (
              <Image
                src={option.image}
                alt={option.label}
                fill
                className="object-cover"
              />
            ) : (
              <div className="bg-muted flex h-full items-center justify-center">
                <ImageIcon className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            {isSelected(option.id) && (
              <div className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}

            {showLabels && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-sm font-medium text-white">
                  {option.label}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {multipleSelection && (
        <p className="text-muted-foreground text-xs">
          You can select multiple options
        </p>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
