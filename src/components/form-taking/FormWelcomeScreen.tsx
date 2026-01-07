"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormWelcomeScreenProps } from "@/lib/form-taking/types";

/**
 * FormWelcomeScreen - Welcome/start screen for form taking
 */
export function FormWelcomeScreen({
  title,
  description,
  buttonText = "Start",
  image,
  video,
  estimatedMinutes,
  showEstimatedTime = false,
  onStart,
  disabled = false,
}: FormWelcomeScreenProps) {
  // Handle Enter key to start
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !disabled) {
        e.preventDefault();
        onStart();
      }
    },
    [disabled, onStart]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const hasMedia = Boolean(image || video);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center p-8 text-center",
        hasMedia && "bg-cover bg-center"
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

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 max-w-2xl space-y-8"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={cn(
            "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl",
            hasMedia && "text-white drop-shadow-lg"
          )}
        >
          {title}
        </motion.h1>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={cn(
              "text-muted-foreground text-lg sm:text-xl",
              hasMedia && "text-white/90"
            )}
          >
            {description}
          </motion.p>
        )}

        {/* Estimated time */}
        {showEstimatedTime && estimatedMinutes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={cn(
              "text-muted-foreground flex items-center justify-center gap-2 text-sm",
              hasMedia && "text-white/80"
            )}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>
              Takes about {estimatedMinutes} minute
              {estimatedMinutes !== 1 ? "s" : ""}
            </span>
          </motion.div>
        )}

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            disabled={disabled}
            className="mt-4 gap-2 text-lg"
          >
            {buttonText}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={cn(
            "text-muted-foreground text-xs",
            hasMedia && "text-white/60"
          )}
        >
          press{" "}
          <kbd className="bg-background/20 rounded border px-1.5 py-0.5 font-mono text-xs">
            Enter
          </kbd>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Compact welcome screen variant
 */
export function FormWelcomeScreenCompact({
  title,
  description,
  buttonText = "Start",
  estimatedMinutes,
  showEstimatedTime = false,
  onStart,
  disabled = false,
}: Omit<FormWelcomeScreenProps, "image" | "video">) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !disabled) {
        e.preventDefault();
        onStart();
      }
    },
    [disabled, onStart]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center"
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}

        {showEstimatedTime && estimatedMinutes && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              About {estimatedMinutes} minute{estimatedMinutes !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <Button
          size="lg"
          onClick={onStart}
          disabled={disabled}
          className="gap-2"
        >
          {buttonText}
          <ArrowRight className="h-5 w-5" />
        </Button>

        <p className="text-muted-foreground text-xs">
          or press{" "}
          <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">
            Enter
          </kbd>
        </p>
      </div>
    </motion.div>
  );
}
