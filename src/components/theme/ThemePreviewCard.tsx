"use client";

/**
 * ThemePreviewCard Component
 * A compact preview card showing a theme's appearance
 */

import { MoreHorizontal, Pencil, Copy, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/theme/types";
import type { ThemeTemplate } from "@/lib/theme/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ThemePreviewCardProps {
  template: ThemeTemplate;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

// Generate background style from theme
function getBackgroundStyle(theme: Theme["background"]): React.CSSProperties {
  if (theme.type === "solid") {
    return { backgroundColor: theme.color || "#FFFFFF" };
  }

  if (theme.type === "gradient" && theme.gradient) {
    const { type, angle, stops } = theme.gradient;
    const gradientStops = stops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    if (type === "radial") {
      return { background: `radial-gradient(circle, ${gradientStops})` };
    }
    return { background: `linear-gradient(${angle}deg, ${gradientStops})` };
  }

  if (theme.type === "image" && theme.image) {
    return {
      backgroundImage: `url(${theme.image.url})`,
      backgroundSize: theme.image.size || "cover",
      backgroundPosition: theme.image.position || "center",
    };
  }

  return { backgroundColor: "#FFFFFF" };
}

export function ThemePreviewCard({
  template,
  isSelected = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  showActions = true,
  className,
}: ThemePreviewCardProps) {
  const { theme } = template;
  const backgroundStyle = getBackgroundStyle(theme.background);

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-md",
        isSelected
          ? "border-foreground ring-2 ring-foreground/20"
          : "border-border hover:border-muted-foreground/50",
        className
      )}
      onClick={onSelect}
    >
      {/* Mini form preview */}
      <div
        className="relative aspect-[4/3] p-4"
        style={backgroundStyle}
      >
        {/* Question text */}
        <div
          className="text-sm font-semibold"
          style={{
            color: theme.colors.questionText || theme.colors.foreground,
            fontFamily: `"${theme.typography.headingFontFamily}", system-ui, sans-serif`,
          }}
        >
          Question
        </div>

        {/* Answer text */}
        <div
          className="mt-1 text-sm"
          style={{
            color: theme.colors.primary,
            fontFamily: `"${theme.typography.fontFamily}", system-ui, sans-serif`,
          }}
        >
          Answer
        </div>

        {/* Mini button */}
        <div
          className="mt-3 inline-block rounded px-4 py-1.5 text-xs font-medium"
          style={{
            backgroundColor: theme.colors.primary,
            color: "#FFFFFF",
            borderRadius:
              theme.buttons.radius === "full"
                ? "9999px"
                : theme.buttons.radius === "lg"
                  ? "8px"
                  : theme.buttons.radius === "md"
                    ? "6px"
                    : theme.buttons.radius === "sm"
                      ? "4px"
                      : "0",
          }}
        />

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Theme name and actions */}
      <div className="flex items-center justify-between border-t bg-background px-3 py-2">
        <span className="truncate text-sm font-medium">{template.name}</span>

        {showActions && (onEdit || onDuplicate || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default ThemePreviewCard;
