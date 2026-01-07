"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { ContentBlockProps, StatementSettings } from "../types";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function Statement({
  question,
  onContinue,
  disabled = false,
}: ContentBlockProps) {
  const settings = question.settings as StatementSettings;
  const content = settings?.content || question.title || "";
  const contentType = settings?.contentType || "plain";
  const buttonText = settings?.buttonText || "Continue";
  const image = settings?.image;
  const imagePosition = settings?.imagePosition || "right";
  const textAlignment = settings?.textAlignment || "left";

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

  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[textAlignment];

  const renderContent = () => {
    if (contentType === "markdown") {
      return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
    return <p className="text-lg leading-relaxed">{content}</p>;
  };

  const renderImage = () => {
    if (!image) return null;
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg",
          imagePosition === "background" && "absolute inset-0"
        )}
      >
        <img
          src={image}
          alt=""
          className={cn(
            "h-full w-full object-cover",
            imagePosition === "background" && "opacity-20"
          )}
        />
      </div>
    );
  };

  // Background image layout
  if (imagePosition === "background" && image) {
    return (
      <div className="relative min-h-[40vh] p-8">
        {renderImage()}
        <div className={cn("relative z-10 space-y-6", alignmentClass)}>
          {renderContent()}
          <Button
            onClick={onContinue}
            disabled={disabled}
            className="gap-2"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  // Horizontal layout (left/right image)
  if ((imagePosition === "left" || imagePosition === "right") && image) {
    return (
      <div
        className={cn(
          "flex flex-col gap-8 p-6 md:flex-row md:items-center",
          imagePosition === "left" && "md:flex-row-reverse"
        )}
      >
        <div className={cn("flex-1 space-y-6", alignmentClass)}>
          {renderContent()}
          <Button
            onClick={onContinue}
            disabled={disabled}
            className="gap-2"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex-1">{renderImage()}</div>
      </div>
    );
  }

  // Vertical layout (top/bottom image) or no image
  return (
    <div className={cn("space-y-6 p-6", alignmentClass)}>
      {imagePosition === "top" && renderImage()}
      {renderContent()}
      {imagePosition === "bottom" && renderImage()}
      <Button
        onClick={onContinue}
        disabled={disabled}
        className="gap-2"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
