"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormNavigationProps } from "@/lib/form-taking/types";

/**
 * FormNavigation - Navigation controls for form taking
 * Shows back/next buttons and keyboard hints
 */
export function FormNavigation({
  canGoBack,
  canGoNext,
  isLastQuestion,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  showKeyboardHints = true,
  className,
}: FormNavigationProps) {
  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-40",
        "bg-background/80 border-t backdrop-blur-sm",
        "px-4 py-3",
        className
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {/* Back/Forward buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            disabled={!canGoBack || isSubmitting}
            aria-label="Go to previous question"
            className="h-10 w-10"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={isLastQuestion ? onSubmit : onNext}
            disabled={(!canGoNext && !isLastQuestion) || isSubmitting}
            aria-label={isLastQuestion ? "Submit form" : "Go to next question"}
            className="h-10 w-10"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Keyboard hints */}
        {showKeyboardHints && (
          <div className="text-muted-foreground hidden items-center gap-4 text-xs sm:flex">
            <span className="flex items-center gap-1">
              press{" "}
              <kbd className="bg-muted rounded border px-1.5 py-0.5 font-mono text-xs">
                Enter
              </kbd>
            </span>
            {canGoBack && (
              <span className="flex items-center gap-1">
                or{" "}
                <kbd className="bg-muted rounded border px-1.5 py-0.5 font-mono text-xs">
                  Esc
                </kbd>{" "}
                to go back
              </span>
            )}
          </div>
        )}

        {/* Submit button (shown on last question) */}
        {isLastQuestion && (
          <Button onClick={onSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        )}

        {/* OK button for non-last questions */}
        {!isLastQuestion && (
          <Button
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
            className="gap-2"
          >
            OK
            <span className="hidden text-xs opacity-70 sm:inline">
              press Enter
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Minimal navigation variant - just arrows
 */
export function FormNavigationMinimal({
  canGoBack,
  canGoNext,
  isLastQuestion,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  className,
}: FormNavigationProps) {
  return (
    <div
      className={cn(
        "fixed right-4 bottom-4 z-40",
        "flex flex-col gap-1",
        className
      )}
    >
      <Button
        variant="secondary"
        size="icon"
        onClick={onBack}
        disabled={!canGoBack || isSubmitting}
        aria-label="Go to previous question"
        className="h-8 w-8 rounded-full shadow-lg"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={isLastQuestion ? onSubmit : onNext}
        disabled={(!canGoNext && !isLastQuestion) || isSubmitting}
        aria-label={isLastQuestion ? "Submit form" : "Go to next question"}
        className="h-8 w-8 rounded-full shadow-lg"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLastQuestion ? (
          <Check className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
