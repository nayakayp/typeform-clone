"use client";

import { useEffect, useState } from "react";
import type { ContentBlockProps, RedirectSettings } from "../types";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Redirect({
  question,
  disabled = false,
}: ContentBlockProps) {
  const settings = question.settings as RedirectSettings;
  const url = settings?.url;
  const delay = settings?.delay ?? 3;
  const openInNewTab = settings?.openInNewTab ?? false;
  const showMessage = settings?.showMessage || "Redirecting you to another page...";

  const [countdown, setCountdown] = useState(delay);

  useEffect(() => {
    if (!url || disabled) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (openInNewTab) {
            window.open(url, "_blank");
          } else {
            window.location.href = url;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [url, openInNewTab, disabled]);

  if (!url) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No redirect URL configured</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6">
        {/* Loading spinner */}
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>

        {/* Message */}
        <p className="text-lg">{showMessage}</p>

        {/* Countdown */}
        <p className="text-sm text-muted-foreground">
          Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>

        {/* Manual redirect button */}
        <Button
          variant="outline"
          onClick={() => {
            if (openInNewTab) {
              window.open(url, "_blank");
            } else {
              window.location.href = url;
            }
          }}
          disabled={disabled}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Go now
        </Button>
      </div>
    </div>
  );
}
