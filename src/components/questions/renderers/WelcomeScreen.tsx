"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { ContentBlockProps, WelcomeScreenSettings } from "../types";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WelcomeScreen({
  question,
  onContinue,
  disabled = false,
}: ContentBlockProps) {
  const settings = question.settings as WelcomeScreenSettings;
  const title = settings?.title || question.title || "Welcome";
  const description = settings?.description || question.description;
  const buttonText = settings?.buttonText || "Start";
  const image = settings?.image;
  const video = settings?.video;
  const showEstimatedTime = settings?.showEstimatedTime;
  const estimatedMinutes = settings?.estimatedMinutes;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !disabled && onContinue) {
        e.preventDefault();
        onContinue();
      }
    },
    [disabled, onContinue]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={cn(
        "relative flex min-h-[60vh] flex-col items-center justify-center p-8 text-center",
        image && "bg-cover bg-center"
      )}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      {/* Overlay for background image */}
      {image && (
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      )}

      {/* Video background */}
      {video && !image && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 max-w-2xl space-y-6">
        {/* Title */}
        <h1
          className={cn(
            "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl",
            (image || video) && "text-white drop-shadow-lg"
          )}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-lg text-muted-foreground sm:text-xl",
              (image || video) && "text-white/90"
            )}
          >
            {description}
          </p>
        )}

        {/* Estimated time */}
        {showEstimatedTime && estimatedMinutes && (
          <div
            className={cn(
              "flex items-center justify-center gap-2 text-sm text-muted-foreground",
              (image || video) && "text-white/80"
            )}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>Takes about {estimatedMinutes} minute{estimatedMinutes !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Start button */}
        <Button
          size="lg"
          onClick={onContinue}
          disabled={disabled}
          className="mt-4 gap-2 text-lg"
        >
          {buttonText}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Keyboard hint */}
        <p
          className={cn(
            "text-xs text-muted-foreground",
            (image || video) && "text-white/60"
          )}
        >
          press <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">Enter ↵</kbd>
        </p>
      </div>
    </div>
  );
}
