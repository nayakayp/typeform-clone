"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Share2, ExternalLink, CheckCircle2 } from "lucide-react";
import type { FormThankYouScreenProps } from "@/lib/form-taking/types";

// Pre-generate confetti particles at module level (outside of render)
const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
];

type ConfettiParticle = {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotateDir: number;
  duration: number;
};

// Generate particles at module load time
function generateConfettiParticles(): ConfettiParticle[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotateDir: Math.random() > 0.5 ? 1 : -1,
    duration: 2 + Math.random(),
  }));
}

const CONFETTI_PARTICLES = generateConfettiParticles();

/**
 * FormThankYouScreen - Completion screen shown after form submission
 */
export function FormThankYouScreen({
  title = "Thank you!",
  description = "Your response has been submitted successfully.",
  showSocialShare = false,
  socialMessage,
  redirectUrl,
  redirectDelay = 5,
  buttonText,
  buttonUrl,
  showConfetti = true,
}: FormThankYouScreenProps) {
  const [countdown, setCountdown] = useState(redirectDelay);
  const [copied, setCopied] = useState(false);

  // Handle redirect countdown
  useEffect(() => {
    if (!redirectUrl || redirectDelay <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl, redirectDelay]);

  // Handle share
  const handleShare = useCallback(async () => {
    const shareData = {
      title: socialMessage || title,
      text: socialMessage || description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to copy link
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [title, description, socialMessage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center p-8 text-center"
    >
      {/* Confetti animation placeholder */}
      {showConfetti && <ConfettiEffect />}

      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}

        {/* Redirect countdown */}
        {redirectUrl && countdown > 0 && (
          <p className="text-muted-foreground text-sm">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        {/* Custom button */}
        {buttonText && buttonUrl && (
          <Button size="lg" asChild className="gap-2">
            <a href={buttonUrl}>
              {buttonText}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}

        {/* Social share */}
        {showSocialShare && (
          <Button variant="outline" onClick={handleShare} className="gap-2">
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share
              </>
            )}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * Simple confetti effect using CSS animations
 */
function ConfettiEffect() {
  const [visible, setVisible] = useState(true);

  // Cleanup after animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {CONFETTI_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: -20,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            y: "100vh",
            rotate: 360 * particle.rotateDir,
            scale: 0,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "linear",
          }}
          className="absolute h-3 w-3 rounded-sm"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}

/**
 * Minimal thank you screen variant
 */
export function FormThankYouScreenMinimal({
  title = "Thank you!",
  description,
}: Pick<FormThankYouScreenProps, "title" | "description">) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="h-8 w-8" strokeWidth={3} />
      </div>

      <h1 className="text-2xl font-bold">{title}</h1>

      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </motion.div>
  );
}
