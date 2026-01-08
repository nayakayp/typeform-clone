"use client";

import { useState } from "react";
import { FileText, Check, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "../types";

interface LegalSettings {
  legalText?: string;
  documentUrl?: string;
  documentTitle?: string;
  requireScroll?: boolean;
  checkboxLabel?: string;
}

interface LegalValue {
  accepted: boolean;
  acceptedAt?: string;
}

export function Legal({
  question,
  value,
  onChange,
  disabled,
  error,
}: QuestionRendererProps<LegalValue | null>) {
  const settings = (question.settings || {}) as LegalSettings;
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const legalText = settings.legalText || "";
  const documentUrl = settings.documentUrl || "";
  const documentTitle = settings.documentTitle || "Terms and Conditions";
  const requireScroll = settings.requireScroll ?? false;
  const checkboxLabel = settings.checkboxLabel || `I agree to the ${documentTitle}`;

  const isAccepted = value?.accepted ?? false;
  const canAccept = !requireScroll || hasScrolledToBottom;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 20;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptChange = (checked: boolean) => {
    onChange({
      accepted: checked,
      acceptedAt: checked ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Document Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">{documentTitle}</h3>
      </div>

      {/* Legal Text */}
      {legalText && (
        <div className="relative">
          <ScrollArea
            className="h-64 rounded-lg border bg-muted/30 p-4"
            onScrollCapture={handleScroll}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {legalText}
            </div>
          </ScrollArea>
          {requireScroll && !hasScrolledToBottom && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-4 text-center">
              <p className="text-sm text-muted-foreground">
                ↓ Scroll to read the full document
              </p>
            </div>
          )}
        </div>
      )}

      {/* External Document Link */}
      {documentUrl && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => window.open(documentUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
          View Full {documentTitle}
        </Button>
      )}

      {/* Acceptance Checkbox */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4 transition-colors",
          isAccepted && "border-primary bg-primary/5",
          !canAccept && "opacity-50"
        )}
      >
        <Checkbox
          id="legal-accept"
          checked={isAccepted}
          onCheckedChange={handleAcceptChange}
          disabled={disabled || !canAccept}
          className="mt-0.5"
        />
        <div className="flex-1">
          <label
            htmlFor="legal-accept"
            className={cn(
              "text-sm font-medium cursor-pointer",
              !canAccept && "cursor-not-allowed"
            )}
          >
            {checkboxLabel}
          </label>
          {requireScroll && !hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground mt-1">
              Please read the entire document before accepting
            </p>
          )}
        </div>
        {isAccepted && (
          <Check className="h-5 w-5 text-primary flex-shrink-0" />
        )}
      </div>

      {/* Acceptance Confirmation */}
      {isAccepted && value?.acceptedAt && (
        <p className="text-xs text-muted-foreground text-center">
          Accepted on {new Date(value.acceptedAt).toLocaleString()}
        </p>
      )}

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
    </div>
  );
}
