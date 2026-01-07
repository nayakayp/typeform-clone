"use client";

/**
 * FontSelector Component
 * Google Fonts selector with search and preview
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { POPULAR_FONTS } from "@/lib/theme/defaults";
import { loadGoogleFont } from "@/lib/theme/utils";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
  className?: string;
}

interface FontOption {
  family: string;
  category: string;
}

// ============================================
// Font Categories
// ============================================

const FONT_CATEGORIES = [
  { id: "all", label: "All Fonts" },
  { id: "sans-serif", label: "Sans Serif" },
  { id: "serif", label: "Serif" },
  { id: "monospace", label: "Monospace" },
  { id: "display", label: "Display" },
  { id: "handwriting", label: "Handwriting" },
] as const;

// ============================================
// Main Component
// ============================================

export function FontSelector({
  value,
  onChange,
  placeholder = "Select font...",
  className,
}: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const loadedFontsRef = useRef<Set<string>>(new Set());

  // Load current font on mount
  useEffect(() => {
    if (value && !loadedFontsRef.current.has(value)) {
      loadGoogleFont(value);
      loadedFontsRef.current.add(value);
    }
  }, [value]);

  // Filter fonts based on search and category
  const filteredFonts = useMemo(() => {
    let fonts = POPULAR_FONTS as readonly FontOption[];

    // Filter by category
    if (category !== "all") {
      fonts = fonts.filter((font) => font.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      fonts = fonts.filter((font) =>
        font.family.toLowerCase().includes(searchLower)
      );
    }

    return fonts;
  }, [search, category]);

  // Handle font selection
  const handleSelect = useCallback(
    (font: string) => {
      onChange(font);
      setOpen(false);

      // Load the font if not already loaded
      if (!loadedFontsRef.current.has(font)) {
        loadGoogleFont(font);
        loadedFontsRef.current.add(font);
      }
    },
    [onChange]
  );

  // Preload fonts on hover
  const handleFontHover = useCallback(
    (font: string) => {
      if (!loadedFontsRef.current.has(font)) {
        loadGoogleFont(font);
        loadedFontsRef.current.add(font);
      }
    },
    []
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          style={{ fontFamily: value }}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="space-y-2 p-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fonts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {FONT_CATEGORIES.map(({ id, label }) => (
              <Button
                key={id}
                variant={category === id ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setCategory(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Font List */}
        <ScrollArea className="h-64">
          <div className="p-2">
            {filteredFonts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No fonts found.
              </p>
            ) : (
              <div className="space-y-1">
                {filteredFonts.map((font) => (
                  <button
                    key={font.family}
                    type="button"
                    onClick={() => handleSelect(font.family)}
                    onMouseEnter={() => handleFontHover(font.family)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors",
                      value === font.family
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: font.family,
                        }}
                      >
                        {font.family}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          value === font.family
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {font.category}
                      </span>
                    </div>
                    {value === font.family && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Font Preview */}
        {value && (
          <div className="border-t p-3">
            <p
              className="text-center text-lg"
              style={{ fontFamily: value }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
            <p
              className="mt-1 text-center text-xs text-muted-foreground"
              style={{ fontFamily: value }}
            >
              0123456789
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default FontSelector;
