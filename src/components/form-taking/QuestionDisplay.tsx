"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavigationDirection, AnswerValue } from "@/lib/form-taking/types";
import {
  QuestionRenderers,
  ContentBlockRenderers,
} from "@/components/questions/renderers";
import { isContentBlockType } from "@/lib/question-types";

// Flexible question type that works with both @/types and @/lib/db/schema/questions
interface DisplayQuestion {
  id: string;
  type: string;
  title?: string | null;
  description?: string | null;
  required?: boolean | null;
  settings?: Record<string, unknown> | null;
  properties?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validations?: any;
}

export interface QuestionDisplayProps {
  question: DisplayQuestion;
  questionNumber: number;
  totalQuestions: number;
  value: AnswerValue;
  error?: string;
  direction: NavigationDirection;
  onChange: (value: AnswerValue) => void;
  onContinue: () => void;
  disabled?: boolean;
  showQuestionNumber?: boolean;
  className?: string;
}

// Animation variants based on direction
const slideVariants = {
  enter: (direction: NavigationDirection) => ({
    y: direction === "forward" ? 50 : -50,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: NavigationDirection) => ({
    y: direction === "forward" ? -50 : 50,
    opacity: 0,
  }),
};

const fadeVariants = {
  enter: {
    opacity: 0,
    scale: 0.98,
  },
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
  },
};

/**
 * QuestionDisplay - Displays a single question with animations
 */
export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  value,
  error,
  direction,
  onChange,
  onContinue,
  disabled = false,
  showQuestionNumber = true,
  className,
}: QuestionDisplayProps) {
  const isContentBlock = isContentBlockType(question.type);

  // Get the appropriate renderer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Renderer: React.ComponentType<any> | null = useMemo(() => {
    if (isContentBlock) {
      return ContentBlockRenderers[question.type] || null;
    }
    return QuestionRenderers[question.type] || null;
  }, [question.type, isContentBlock]);

  if (!Renderer) {
    return (
      <div className="text-muted-foreground text-center">
        Unsupported question type: {question.type}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={question.id}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          y: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className={cn(
          "mx-auto w-full max-w-2xl px-4",
          "flex min-h-[60vh] flex-col justify-center",
          className
        )}
      >
        {/* Question header */}
        {!isContentBlock && (
          <div className="mb-6 space-y-2">
            {/* Question number */}
            {showQuestionNumber && questionNumber > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-primary text-sm font-medium">
                  {questionNumber}
                </span>
                <span className="text-muted-foreground text-sm">
                  of {totalQuestions}
                </span>
                {question.required && (
                  <span className="text-destructive text-sm">*</span>
                )}
              </div>
            )}

            {/* Question title */}
            {question.title && (
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {question.title}
              </h2>
            )}

            {/* Question description */}
            {question.description && (
              <p className="text-muted-foreground text-base sm:text-lg">
                {question.description}
              </p>
            )}
          </div>
        )}

        {/* Question renderer */}
        <div className="space-y-4">
          {isContentBlock ? (
            <Renderer
              question={question as never}
              onContinue={onContinue}
              disabled={disabled}
            />
          ) : (
            <Renderer
              question={question as never}
              value={value as never}
              onChange={onChange as never}
              error={error}
              disabled={disabled}
              autoFocus
            />
          )}
        </div>

        {error && !isContentBlock && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * QuestionDisplayFade - Alternative with fade animation
 */
export function QuestionDisplayFade({
  question,
  questionNumber,
  totalQuestions,
  value,
  error,
  onChange,
  onContinue,
  disabled = false,
  showQuestionNumber = true,
  className,
}: Omit<QuestionDisplayProps, "direction">) {
  const isContentBlock = isContentBlockType(question.type);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Renderer: React.ComponentType<any> | null = useMemo(() => {
    if (isContentBlock) {
      return ContentBlockRenderers[question.type] || null;
    }
    return QuestionRenderers[question.type] || null;
  }, [question.type, isContentBlock]);

  if (!Renderer) {
    return (
      <div className="text-muted-foreground text-center">
        Unsupported question type: {question.type}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={fadeVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3 }}
        className={cn(
          "mx-auto w-full max-w-2xl px-4",
          "flex min-h-[60vh] flex-col justify-center",
          className
        )}
      >
        {!isContentBlock && (
          <div className="mb-6 space-y-2">
            {showQuestionNumber && questionNumber > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-primary text-sm font-medium">
                  {questionNumber}
                </span>
                <span className="text-muted-foreground text-sm">
                  of {totalQuestions}
                </span>
                {question.required && (
                  <span className="text-destructive text-sm">*</span>
                )}
              </div>
            )}

            {question.title && (
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {question.title}
              </h2>
            )}

            {question.description && (
              <p className="text-muted-foreground text-base sm:text-lg">
                {question.description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {isContentBlock ? (
            <Renderer
              question={question as never}
              onContinue={onContinue}
              disabled={disabled}
            />
          ) : (
            <Renderer
              question={question as never}
              value={value as never}
              onChange={onChange as never}
              error={error}
              disabled={disabled}
              autoFocus
            />
          )}
        </div>

        {error && !isContentBlock && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
