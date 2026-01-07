"use client";

import * as React from "react";
import {
  LogicEngine,
  createLogicEngine,
  type LogicContext,
} from "@/lib/logic/engine";
import type {
  SkipLogic,
  VisibilityLogic,
  Calculator,
  HiddenField,
  LogicValidationResult,
} from "@/lib/logic/types";
import type { BuilderQuestion } from "@/types/builder";

interface UseLogicEngineOptions {
  questions: BuilderQuestion[];
  skipLogicRules?: SkipLogic[];
  visibilityRules?: VisibilityLogic[];
  calculators?: Calculator[];
  hiddenFields?: HiddenField[];
  urlParams?: Record<string, string>;
  initialResponses?: Record<string, unknown>;
}

interface UseLogicEngineReturn {
  // Engine instance
  engine: LogicEngine | null;

  // Current state
  responses: Record<string, unknown>;
  currentQuestionId: string | null;
  visibleQuestions: BuilderQuestion[];
  progress: number;
  context: LogicContext | null;

  // Actions
  setResponse: (questionId: string, value: unknown) => void;
  goToQuestion: (questionId: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  reset: () => void;

  // Helpers
  isQuestionVisible: (questionId: string) => boolean;
  getDisplayValue: (questionId: string) => string;
  interpolate: (text: string) => string;
  validate: () => LogicValidationResult;

  // State flags
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function useLogicEngine(
  options: UseLogicEngineOptions
): UseLogicEngineReturn {
  const {
    questions,
    skipLogicRules = [],
    visibilityRules = [],
    calculators = [],
    hiddenFields = [],
    urlParams = {},
    initialResponses = {},
  } = options;

  // Create the engine
  const [engine] = React.useState<LogicEngine>(() =>
    createLogicEngine({
      questions,
      skipLogicRules,
      visibilityRules,
      calculators,
      hiddenFields,
      initialContext: {
        responses: initialResponses,
        urlParams,
      },
    })
  );

  // State
  const [responses, setResponses] =
    React.useState<Record<string, unknown>>(initialResponses);
  const [currentQuestionId, setCurrentQuestionId] = React.useState<
    string | null
  >(() => {
    const visibleQuestions = engine.getVisibleQuestions();
    return visibleQuestions.length > 0 ? visibleQuestions[0].id : null;
  });

  // Update engine when options change
  React.useEffect(() => {
    // For now, we don't recreate the engine when questions change
    // This could be enhanced to support dynamic question updates
  }, [questions, skipLogicRules, visibilityRules]);

  // Derived state
  const visibleQuestions = React.useMemo(() => {
    engine.updateResponses(responses);
    return engine.getVisibleQuestions();
  }, [engine, responses]);

  const progress = React.useMemo(() => {
    if (!currentQuestionId) return 0;
    return engine.getProgress(currentQuestionId);
  }, [engine, currentQuestionId]);

  const context = React.useMemo(() => {
    return engine.getContext();
  }, [engine, responses]);

  // Navigation state
  const currentIndex = React.useMemo(() => {
    if (!currentQuestionId) return -1;
    return visibleQuestions.findIndex((q) => q.id === currentQuestionId);
  }, [visibleQuestions, currentQuestionId]);

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === visibleQuestions.length - 1;
  const hasNext = currentIndex < visibleQuestions.length - 1;
  const hasPrevious = currentIndex > 0;

  // Actions
  const setResponse = React.useCallback(
    (questionId: string, value: unknown) => {
      setResponses((prev) => {
        const newResponses = { ...prev, [questionId]: value };
        engine.updateResponses(newResponses);
        return newResponses;
      });
    },
    [engine]
  );

  const goToQuestion = React.useCallback(
    (questionId: string) => {
      if (engine.isQuestionVisible(questionId)) {
        setCurrentQuestionId(questionId);
      }
    },
    [engine]
  );

  const goToNext = React.useCallback(() => {
    if (!currentQuestionId) return;

    const nextQuestion = engine.getNextQuestion(currentQuestionId);
    if (nextQuestion) {
      setCurrentQuestionId(nextQuestion.id);
    }
  }, [engine, currentQuestionId]);

  const goToPrevious = React.useCallback(() => {
    if (!currentQuestionId) return;

    const prevQuestion = engine.getPreviousQuestion(currentQuestionId);
    if (prevQuestion) {
      setCurrentQuestionId(prevQuestion.id);
    }
  }, [engine, currentQuestionId]);

  const reset = React.useCallback(() => {
    setResponses({});
    engine.updateResponses({});
    const visibleQuestions = engine.getVisibleQuestions();
    setCurrentQuestionId(
      visibleQuestions.length > 0 ? visibleQuestions[0].id : null
    );
  }, [engine]);

  // Helpers
  const isQuestionVisible = React.useCallback(
    (questionId: string) => {
      return engine.isQuestionVisible(questionId);
    },
    [engine]
  );

  const getDisplayValue = React.useCallback(
    (questionId: string) => {
      return engine.getDisplayValue(questionId);
    },
    [engine]
  );

  const interpolate = React.useCallback(
    (text: string) => {
      return engine.interpolate(text);
    },
    [engine]
  );

  const validate = React.useCallback(() => {
    return engine.validate();
  }, [engine]);

  return {
    engine,
    responses,
    currentQuestionId,
    visibleQuestions,
    progress,
    context,
    setResponse,
    goToQuestion,
    goToNext,
    goToPrevious,
    reset,
    isQuestionVisible,
    getDisplayValue,
    interpolate,
    validate,
    isFirstQuestion,
    isLastQuestion,
    hasNext,
    hasPrevious,
  };
}

/**
 * Hook for using logic engine in builder mode (without navigation)
 */
export function useLogicEngineBuilder(options: UseLogicEngineOptions) {
  const {
    questions,
    skipLogicRules = [],
    visibilityRules = [],
    calculators = [],
    hiddenFields = [],
  } = options;

  // Create the engine
  const engine = React.useMemo(() => {
    return createLogicEngine({
      questions,
      skipLogicRules,
      visibilityRules,
      calculators,
      hiddenFields,
    });
  }, [questions, skipLogicRules, visibilityRules, calculators, hiddenFields]);

  // Validation result
  const validationResult = React.useMemo(() => {
    return engine.validate();
  }, [engine]);

  // Get questions with logic applied
  const getQuestionsWithLogic = React.useCallback(
    (testResponses: Record<string, unknown>) => {
      engine.updateResponses(testResponses);
      return engine.getVisibleQuestions();
    },
    [engine]
  );

  // Test a specific path
  const testPath = React.useCallback(
    (responses: Record<string, unknown>): string[] => {
      engine.updateResponses(responses);
      const path: string[] = [];

      const visibleQuestions = engine.getVisibleQuestions();
      if (visibleQuestions.length === 0) return path;

      let currentQuestion = visibleQuestions[0];
      const visited = new Set<string>();

      while (currentQuestion && !visited.has(currentQuestion.id)) {
        visited.add(currentQuestion.id);
        path.push(currentQuestion.id);

        const nextQuestion = engine.getNextQuestion(currentQuestion.id);
        if (!nextQuestion) break;
        currentQuestion = nextQuestion;
      }

      return path;
    },
    [engine]
  );

  return {
    engine,
    validationResult,
    getQuestionsWithLogic,
    testPath,
    isValid: validationResult.valid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
  };
}
