"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, Heart, ThumbsUp } from "lucide-react";
import type { QuestionRendererProps, RatingSettings } from "../types";

export function Rating({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<number | null>) {
  const settings = question.settings as RatingSettings;
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const maxRating = settings?.maxRating || 5;
  const icon = settings?.icon || "star";

  const IconComponent =
    icon === "heart" ? Heart : icon === "thumbs" ? ThumbsUp : Star;

  const displayValue = hoverValue ?? value ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {settings?.lowLabel && (
          <span className="text-muted-foreground mr-2 text-sm">
            {settings.lowLabel}
          </span>
        )}

        <div className="flex gap-1">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              className={cn(
                "focus:ring-primary relative p-1 transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onClick={() => onChange(rating)}
              onMouseEnter={() => setHoverValue(rating)}
              onMouseLeave={() => setHoverValue(null)}
            >
              <IconComponent
                className={cn(
                  "h-10 w-10 transition-colors",
                  rating <= displayValue
                    ? icon === "heart"
                      ? "fill-red-500 text-red-500"
                      : "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
              {settings?.showNumbers && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {rating}
                </span>
              )}
            </button>
          ))}
        </div>

        {settings?.highLabel && (
          <span className="text-muted-foreground ml-2 text-sm">
            {settings.highLabel}
          </span>
        )}
      </div>

      {value && (
        <p className="text-muted-foreground text-sm">
          You selected {value} out of {maxRating}
        </p>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
