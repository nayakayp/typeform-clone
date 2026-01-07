"use client";

import * as React from "react";
import { X, MessageCircle, FileText, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  EmbedType,
  StandardEmbedOptions,
  PopupEmbedOptions,
  SliderEmbedOptions,
  WidgetEmbedOptions,
} from "@/lib/share/types";

export interface EmbedPreviewProps {
  formUrl: string;
  embedType: EmbedType;
  options: StandardEmbedOptions | PopupEmbedOptions | SliderEmbedOptions | WidgetEmbedOptions;
  className?: string;
}

export function EmbedPreview({
  formUrl,
  embedType,
  options,
  className,
}: EmbedPreviewProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div className={cn("relative overflow-hidden rounded-lg border", className)}>
      {/* Preview Container - Simulates a website */}
      <div className="bg-muted/50 relative min-h-[400px] p-4">
        {/* Fake website header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-muted-foreground/20 h-3 w-3 rounded-full" />
          <div className="bg-muted-foreground/20 h-3 w-3 rounded-full" />
          <div className="bg-muted-foreground/20 h-3 w-3 rounded-full" />
          <div className="bg-muted-foreground/10 ml-4 h-4 flex-1 rounded" />
        </div>

        {/* Fake website content */}
        <div className="space-y-4">
          <div className="bg-muted-foreground/10 h-6 w-3/4 rounded" />
          <div className="bg-muted-foreground/10 h-4 w-full rounded" />
          <div className="bg-muted-foreground/10 h-4 w-5/6 rounded" />
          <div className="bg-muted-foreground/10 h-4 w-4/5 rounded" />
        </div>

        {/* Embed Preview based on type */}
        {embedType === "standard" && (
          <StandardPreview formUrl={formUrl} options={options as StandardEmbedOptions} />
        )}

        {embedType === "popup" && (
          <PopupPreview
            formUrl={formUrl}
            options={options as PopupEmbedOptions}
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
          />
        )}

        {embedType === "slider" && (
          <SliderPreview
            formUrl={formUrl}
            options={options as SliderEmbedOptions}
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
          />
        )}

        {embedType === "widget" && (
          <WidgetPreview
            formUrl={formUrl}
            options={options as WidgetEmbedOptions}
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}

// Standard iframe preview
function StandardPreview({
  options,
}: {
  formUrl: string;
  options: StandardEmbedOptions;
}) {
  return (
    <div
      className="bg-background mt-6 overflow-hidden rounded-lg border shadow-sm"
      style={{
        width: options.width,
        height: options.height,
        maxHeight: "250px",
      }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
        <div className="text-muted-foreground text-center text-sm">
          Form Preview
        </div>
        <div className="text-muted-foreground/60 text-center text-xs">
          {options.width} x {options.height}
        </div>
      </div>
    </div>
  );
}

// Popup modal preview
function PopupPreview({
  options,
  isOpen,
  onOpen,
  onClose,
}: {
  formUrl: string;
  options: PopupEmbedOptions;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="mt-6">
        <button
          onClick={onOpen}
          style={{
            backgroundColor: options.buttonColor,
            color: options.buttonTextColor,
          }}
          className="rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {options.buttonText}
        </button>
      </div>

      {/* Modal overlay */}
      {isOpen && (
        <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div
            className="bg-background relative rounded-lg border shadow-xl"
            style={{
              width: "80%",
              maxWidth: options.width,
              height: "60%",
              maxHeight: options.height,
            }}
          >
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-700"
            >
              <X className="size-4" />
            </button>
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="text-muted-foreground text-sm">Popup Form</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Slider panel preview
function SliderPreview({
  options,
  isOpen,
  onOpen,
  onClose,
}: {
  formUrl: string;
  options: SliderEmbedOptions;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const isLeft = options.position === "left";

  return (
    <>
      <div className="mt-6">
        <button
          onClick={onOpen}
          style={{
            backgroundColor: options.buttonColor,
            color: options.buttonTextColor,
          }}
          className="rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {options.buttonText}
        </button>
      </div>

      {/* Slider panel */}
      <div
        className={cn(
          "bg-background absolute top-0 bottom-0 border shadow-xl transition-transform duration-300",
          isLeft ? "left-0 border-r" : "right-0 border-l",
          isOpen
            ? "translate-x-0"
            : isLeft
              ? "-translate-x-full"
              : "translate-x-full"
        )}
        style={{ width: "50%" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className="text-muted-foreground text-sm">Slider Form</div>
          <div className="text-muted-foreground/60 text-xs">
            Position: {options.position}
          </div>
        </div>
      </div>
    </>
  );
}

// Widget chat-style preview
function WidgetPreview({
  options,
  isOpen,
  onOpen,
  onClose,
}: {
  formUrl: string;
  options: WidgetEmbedOptions;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const isLeft = options.position === "bottom-left";

  const getIcon = () => {
    switch (options.buttonIcon) {
      case "chat":
        return <MessageCircle className="size-6" />;
      case "form":
        return <FileText className="size-6" />;
      case "help":
        return <HelpCircle className="size-6" />;
      default:
        return <MessageCircle className="size-6" />;
    }
  };

  return (
    <>
      {/* Widget button */}
      <button
        onClick={isOpen ? onClose : onOpen}
        style={{ backgroundColor: options.buttonColor }}
        className={cn(
          "absolute bottom-4 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105",
          isLeft ? "left-4" : "right-4"
        )}
      >
        {isOpen ? <X className="size-6" /> : getIcon()}
      </button>

      {/* Widget popup */}
      {isOpen && (
        <div
          className={cn(
            "bg-background absolute bottom-20 w-80 rounded-lg border shadow-xl",
            isLeft ? "left-4" : "right-4"
          )}
        >
          {/* Greeting */}
          <div className="border-b p-4">
            <p className="font-medium">{options.greeting}</p>
          </div>
          {/* Form placeholder */}
          <div className="flex h-48 flex-col items-center justify-center gap-2 p-4">
            <div className="text-muted-foreground text-sm">Widget Form</div>
          </div>
        </div>
      )}
    </>
  );
}
