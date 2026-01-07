"use client";

import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ContentBlockProps, ImageBlockSettings } from "../types";
import { ArrowRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageBlock({
  question,
  onContinue,
  disabled = false,
}: ContentBlockProps) {
  const settings = question.settings as ImageBlockSettings;
  const url = settings?.url;
  const alt = settings?.alt || "Image";
  const caption = settings?.caption;
  const size = settings?.size || "medium";
  const alignment = settings?.alignment || "center";
  const link = settings?.link;
  const lightbox = settings?.lightbox ?? true;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !disabled && onContinue) {
        e.preventDefault();
        onContinue();
      }
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    },
    [disabled, onContinue, isLightboxOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const sizeClasses = {
    small: "max-w-xs",
    medium: "max-w-md",
    large: "max-w-2xl",
    full: "w-full",
  };

  const alignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  if (!url) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No image URL configured</p>
      </div>
    );
  }

  const ImageComponent = (
    <figure
      className={cn(
        "overflow-hidden rounded-lg",
        sizeClasses[size],
        alignmentClasses[alignment]
      )}
    >
      <div className="group relative">
        <img
          src={url}
          alt={alt}
          className="h-auto w-full object-contain"
        />

        {/* Lightbox trigger overlay */}
        {lightbox && (
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100"
            aria-label="View full size"
          >
            <div className="rounded-full bg-white/90 p-2">
              <ZoomIn className="h-5 w-5 text-black" />
            </div>
          </button>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Image with optional link */}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {ImageComponent}
        </a>
      ) : (
        ImageComponent
      )}

      {/* Lightbox dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[90vw] border-none bg-transparent p-0 shadow-none">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={url}
            alt={alt}
            className="max-h-[85vh] w-auto rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>

      {/* Continue button */}
      {onContinue && (
        <div
          className={cn(
            "flex",
            alignment === "left" && "justify-start",
            alignment === "center" && "justify-center",
            alignment === "right" && "justify-end"
          )}
        >
          <Button
            onClick={onContinue}
            disabled={disabled}
            className="gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
