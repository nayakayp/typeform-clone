"use client";

import { useReducer, useCallback, useMemo } from "react";
import type { Form, Question } from "@/types";
import type { Theme } from "@/lib/theme/types";
import {
  type FormTakingState,
  type FormTakingAction,
  type AnswerValue,
  type AnswersMap,
  createInitialFormTakingState,
  isAnswerableQuestion,
} from "@/lib/form-taking/types";
import {
  validateQuestion,
  getNextQuestionIndex,
  getPreviousQuestionIndex,
} from "@/lib/form-taking/utils";

/**
 * Reducer for form taking state
 */
function formTakingReducer(
  state: FormTakingState,
  action: FormTakingAction
): FormTakingState {
  switch (action.type) {
    case "SET_FORM":
      return {
        ...state,
        form: action.payload.form,
        questions: action.payload.questions,
      };

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      };

    case "START_FORM":
      return {
        ...state,
        isStarted: true,
        startTime: new Date(),
        currentIndex: state.questions[0]?.type === "welcome_screen" ? 1 : 0,
      };

    case "GO_NEXT": {
      const nextIndex = getNextQuestionIndex(
        state.currentIndex,
        state.questions,
        state.answers
      );
      return {
        ...state,
        currentIndex: nextIndex,
        direction: "forward",
      };
    }

    case "GO_PREVIOUS": {
      const prevIndex = getPreviousQuestionIndex(state.currentIndex);
      return {
        ...state,
        currentIndex: prevIndex,
        direction: "backward",
      };
    }

    case "GO_TO_QUESTION":
      return {
        ...state,
        currentIndex: Math.max(
          0,
          Math.min(action.payload, state.questions.length - 1)
        ),
        direction: action.payload > state.currentIndex ? "forward" : "backward",
      };

    case "SET_ANSWER":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.value,
        },
        // Clear error when answer is set
        errors: {
          ...state.errors,
          [action.payload.questionId]: "",
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.questionId]: action.payload.error,
        },
      };

    case "CLEAR_ERROR": {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors,
      };
    }

    case "CLEAR_ALL_ERRORS":
      return {
        ...state,
        errors: {},
      };

    case "START_SUBMIT":
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };

    case "SUBMIT_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        isSubmitted: true,
        responseId: action.payload,
        endTime: new Date(),
      };

    case "SUBMIT_ERROR":
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      };

    case "RESET":
      return createInitialFormTakingState();

    default:
      return state;
  }
}

export interface UseFormTakingOptions {
  form: Form;
  questions: Question[];
  theme?: Theme;
  onSubmit?: (answers: AnswersMap) => Promise<string | void>;
}

export interface UseFormTakingReturn {
  // State
  state: FormTakingState;
  currentQuestion: Question | null;
  currentQuestionNumber: number;
  totalQuestions: number;
  progress: number;

  // Actions
  startForm: () => void;
  goNext: () => void;
  goPrevious: () => void;
  goToQuestion: (index: number) => void;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  validateCurrentQuestion: () => boolean;
  submitForm: () => Promise<void>;
  reset: () => void;

  // Computed
  canGoBack: boolean;
  canGoNext: boolean;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isWelcomeScreen: boolean;
  isThankYouScreen: boolean;
  currentAnswer: AnswerValue;
  currentError: string | undefined;
}

/**
 * Hook for managing form taking state and interactions
 */
export function useFormTaking({
  form,
  questions,
  theme,
  onSubmit,
}: UseFormTakingOptions): UseFormTakingReturn {
  const [state, dispatch] = useReducer(
    formTakingReducer,
    createInitialFormTakingState()
  );

  // Initialize form data on mount
  useMemo(() => {
    dispatch({ type: "SET_FORM", payload: { form, questions } });
    if (theme) {
      dispatch({ type: "SET_THEME", payload: theme });
    }
  }, [form, questions, theme]);

  // Current question
  const currentQuestion = useMemo(() => {
    return state.questions[state.currentIndex] || null;
  }, [state.questions, state.currentIndex]);

  // Filter out non-answerable questions for counting
  const answerableQuestions = useMemo(() => {
    return state.questions.filter(isAnswerableQuestion);
  }, [state.questions]);

  // Question numbers (excluding welcome/thank you screens)
  const currentQuestionNumber = useMemo(() => {
    if (!currentQuestion || !isAnswerableQuestion(currentQuestion)) return 0;
    return (
      answerableQuestions.findIndex((q) => q.id === currentQuestion.id) + 1
    );
  }, [currentQuestion, answerableQuestions]);

  const totalQuestions = answerableQuestions.length;

  // Progress percentage
  const progress = useMemo(() => {
    if (totalQuestions === 0) return 0;
    return Math.round((currentQuestionNumber / totalQuestions) * 100);
  }, [currentQuestionNumber, totalQuestions]);

  // Navigation state
  const isFirstQuestion = state.currentIndex === 0;
  const isLastQuestion = state.currentIndex === state.questions.length - 1;
  const isWelcomeScreen = currentQuestion?.type === "welcome_screen";
  const isThankYouScreen = currentQuestion?.type === "thank_you_screen";

  // Check if welcome screen exists at index 0
  const hasWelcomeScreen =
    state.questions.length > 0 && state.questions[0].type === "welcome_screen";

  const canGoBack = state.currentIndex > (hasWelcomeScreen ? 1 : 0);
  const canGoNext = state.currentIndex < state.questions.length - 1;

  // Current answer and error
  const currentAnswer = currentQuestion
    ? state.answers[currentQuestion.id]
    : null;
  const currentError = currentQuestion
    ? state.errors[currentQuestion.id]
    : undefined;

  // Actions
  const startForm = useCallback(() => {
    dispatch({ type: "START_FORM" });
  }, []);

  const validateCurrentQuestion = useCallback((): boolean => {
    if (!currentQuestion || !isAnswerableQuestion(currentQuestion)) {
      return true;
    }

    const error = validateQuestion(
      state.answers[currentQuestion.id],
      currentQuestion
    );

    if (error) {
      dispatch({
        type: "SET_ERROR",
        payload: { questionId: currentQuestion.id, error },
      });
      return false;
    }

    dispatch({ type: "CLEAR_ERROR", payload: currentQuestion.id });
    return true;
  }, [currentQuestion, state.answers]);

  const goNext = useCallback(() => {
    // Validate before moving forward
    if (!validateCurrentQuestion()) {
      return;
    }
    dispatch({ type: "GO_NEXT" });
  }, [validateCurrentQuestion]);

  const goPrevious = useCallback(() => {
    dispatch({ type: "GO_PREVIOUS" });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: "GO_TO_QUESTION", payload: index });
  }, []);

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    dispatch({ type: "SET_ANSWER", payload: { questionId, value } });
  }, []);

  const submitForm = useCallback(async () => {
    // Validate current question before submit
    if (!validateCurrentQuestion()) {
      return;
    }

    dispatch({ type: "START_SUBMIT" });

    try {
      const responseId = await onSubmit?.(state.answers);
      dispatch({
        type: "SUBMIT_SUCCESS",
        payload: responseId || `response_${Date.now()}`,
      });

      // Navigate to thank you screen if it exists
      const thankYouIndex = state.questions.findIndex(
        (q) => q.type === "thank_you_screen"
      );
      if (thankYouIndex !== -1) {
        dispatch({ type: "GO_TO_QUESTION", payload: thankYouIndex });
      }
    } catch (error) {
      dispatch({
        type: "SUBMIT_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "An error occurred while submitting",
      });
    }
  }, [validateCurrentQuestion, onSubmit, state.answers, state.questions]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_FORM", payload: { form, questions } });
    if (theme) {
      dispatch({ type: "SET_THEME", payload: theme });
    }
  }, [form, questions, theme]);

  return {
    state,
    currentQuestion,
    currentQuestionNumber,
    totalQuestions,
    progress,
    startForm,
    goNext,
    goPrevious,
    goToQuestion,
    setAnswer,
    validateCurrentQuestion,
    submitForm,
    reset,
    canGoBack,
    canGoNext,
    isFirstQuestion,
    isLastQuestion,
    isWelcomeScreen,
    isThankYouScreen,
    currentAnswer,
    currentError,
  };
}
