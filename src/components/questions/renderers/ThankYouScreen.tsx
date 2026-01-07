"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { ContentBlockProps, ThankYouScreenSettings } from "../types";
import { CheckCircle, Share2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export function ThankYouScreen({
  question,
  disabled = false,
}: ContentBlockProps) {
  const settings = question.settings as ThankYouScreenSettings;
  const title = settings?.title || "Thank you!";
  const description = settings?.description || "Your response has been recorded.";
  const showSocialShare = settings?.showSocialShare;
  const socialMessage = settings?.socialMessage || "I just completed a survey!";
  const redirectUrl = settings?.redirectUrl;
  const redirectDelay = settings?.redirectDelay || 5;
  const buttonText = settings?.buttonText;
  const buttonUrl = settings?.buttonUrl;
  const showConfetti = settings?.showConfetti ?? true;

  // Confetti effect
  useEffect(() => {
    if (showConfetti) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [showConfetti]);

  // Redirect after delay
  useEffect(() => {
    if (redirectUrl && redirectDelay > 0) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, redirectDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectUrl, redirectDelay]);

  const handleShare = async (platform: "twitter" | "facebook" | "linkedin") => {
    const encodedMessage = encodeURIComponent(socialMessage);
    const currentUrl = encodeURIComponent(window.location.href);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${currentUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}

        {/* Social share buttons */}
        {showSocialShare && (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("twitter")}
              disabled={disabled}
              aria-label="Share on Twitter"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("facebook")}
              disabled={disabled}
              aria-label="Share on Facebook"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("linkedin")}
              disabled={disabled}
              aria-label="Share on LinkedIn"
            >
              <Share2 className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
          </div>
        )}

        {/* Custom button */}
        {buttonText && buttonUrl && (
          <Button
            size="lg"
            onClick={() => window.open(buttonUrl, "_blank")}
            disabled={disabled}
            className="gap-2"
          >
            {buttonText}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        {/* Redirect notice */}
        {redirectUrl && (
          <p className="text-sm text-muted-foreground">
            Redirecting in {redirectDelay} seconds...
          </p>
        )}
      </div>
    </div>
  );
}
