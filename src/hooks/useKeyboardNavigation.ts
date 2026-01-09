"use client";

import { useEffect, useCallback } from "react";
import type { Question } from "@/types";
import type { AnswerValue } from "@/lib/form-taking/types";

export interface UseKeyboardNavigationOptions {
  /**
   * Callback for going to next question (triggered by Enter)
   */
  onNext?: () => void;

  /**
   * Callback for going to previous question (triggered by Escape or Up arrow)
   */
  onPrevious?: () => void;

  /**
   * Callback for submitting the form (triggered by Enter on last question)
   */
  onSubmit?: () => void;

  /**
   * Callback for selecting an option by number key (1-9)
   */
  onSelectOption?: (index: number) => void;

  /**
   * Current question for context-aware keyboard handling
   */
  currentQuestion?: Question | null;

  /**
   * Current answer value
   */
  currentAnswer?: AnswerValue;

  /**
   * Setter for answer value
   */
  setAnswer?: (value: AnswerValue) => void;

  /**
   * Whether keyboard navigation is enabled
   */
  enabled?: boolean;

  /**
   * Whether we're on the last question
   */
  isLastQuestion?: boolean;

  /**
   * Whether form is being submitted
   */
  isSubmitting?: boolean;
}

export interface UseKeyboardNavigationReturn {
  /**
   * List of active keyboard shortcuts for display
   */
  shortcuts: KeyboardShortcut[];
}

export interface KeyboardShortcut {
  key: string;
  description: string;
}

/**
 * Hook for keyboard navigation in form taking
 */
export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onSubmit,
  onSelectOption,
  currentQuestion,
  currentAnswer: _currentAnswer,
  setAnswer,
  enabled = true,
  isLastQuestion = false,
  isSubmitting = false,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || isSubmitting) return;

      // Don't intercept if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Handle Enter key
      // Note: LongText component handles Shift+Enter for line breaks internally,
      // so Enter (without Shift) should trigger navigation for all elements
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (isLastQuestion && onSubmit) {
          onSubmit();
        } else if (onNext) {
          onNext();
        }
        return;
      }

      // Handle Escape key (go back)
      if (event.key === "Escape") {
        event.preventDefault();
        onPrevious?.();
        return;
      }

      // Skip the rest if we're in an input field
      if (isInputField) return;

      // Handle Up/Down arrow keys for navigation
      if (event.key === "ArrowUp" && event.metaKey) {
        event.preventDefault();
        onPrevious?.();
        return;
      }

      if (event.key === "ArrowDown" && event.metaKey) {
        event.preventDefault();
        onNext?.();
        return;
      }

      // Handle number keys for option selection (1-9)
      if (/^[1-9]$/.test(event.key) && currentQuestion) {
        const optionIndex = parseInt(event.key, 10) - 1;

        // Check if question type supports option selection
        const optionTypes = [
          "multiple_choice",
          "checkboxes",
          "dropdown",
          "picture_choice",
        ];

        if (optionTypes.includes(currentQuestion.type)) {
          event.preventDefault();
          onSelectOption?.(optionIndex);
          return;
        }
      }

      // Handle letter keys (A-Z) for option selection
      if (
        /^[a-zA-Z]$/.test(event.key) &&
        !event.metaKey &&
        !event.ctrlKey &&
        currentQuestion
      ) {
        const optionIndex =
          event.key.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);

        const optionTypes = [
          "multiple_choice",
          "checkboxes",
          "dropdown",
          "picture_choice",
        ];

        if (optionTypes.includes(currentQuestion.type)) {
          const settings = currentQuestion.settings as {
            options?: Array<{ id: string }>;
          };
          const options = settings?.options || [];

          if (optionIndex >= 0 && optionIndex < options.length) {
            event.preventDefault();
            onSelectOption?.(optionIndex);
            return;
          }
        }
      }

      // Handle Y/N for Yes/No questions
      if (currentQuestion?.type === "yes_no") {
        if (event.key.toLowerCase() === "y") {
          event.preventDefault();
          setAnswer?.("yes");
          return;
        }
        if (event.key.toLowerCase() === "n") {
          event.preventDefault();
          setAnswer?.("no");
          return;
        }
      }

      // Handle number keys for rating/scale questions
      if (
        currentQuestion &&
        ["rating", "opinion_scale", "nps"].includes(currentQuestion.type)
      ) {
        const num = parseInt(event.key, 10);
        if (!isNaN(num)) {
          event.preventDefault();
          setAnswer?.(num);
          return;
        }
      }
    },
    [
      enabled,
      isSubmitting,
      isLastQuestion,
      onNext,
      onPrevious,
      onSubmit,
      onSelectOption,
      currentQuestion,
      setAnswer,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Build shortcuts list based on current context
  const shortcuts: KeyboardShortcut[] = [];

  if (enabled && !isSubmitting) {
    shortcuts.push({
      key: "Enter",
      description: isLastQuestion ? "Submit" : "Continue",
    });

    shortcuts.push({
      key: "Esc",
      description: "Go back",
    });

    if (currentQuestion) {
      const optionTypes = [
        "multiple_choice",
        "checkboxes",
        "dropdown",
        "picture_choice",
      ];

      if (optionTypes.includes(currentQuestion.type)) {
        shortcuts.push({
          key: "A-Z",
          description: "Select option",
        });
      }

      if (currentQuestion.type === "yes_no") {
        shortcuts.push({
          key: "Y / N",
          description: "Select yes or no",
        });
      }

      if (["rating", "opinion_scale", "nps"].includes(currentQuestion.type)) {
        shortcuts.push({
          key: "0-9",
          description: "Select rating",
        });
      }
    }
  }

  return { shortcuts };
}
