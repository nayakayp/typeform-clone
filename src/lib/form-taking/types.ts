/**
 * Form Taking Types
 * Types for the respondent experience when filling out a form
 */

import type { Form, Question } from "@/types";
import type { Theme } from "@/lib/theme/types";

// Navigation direction for animations and logic
export type NavigationDirection = "forward" | "backward";

// Answer value types - flexible to support all question types
export type AnswerValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Record<string, unknown>
  | null;

// Map of answers keyed by question ID
export interface AnswersMap {
  [questionId: string]: AnswerValue;
}

// Validation error for a specific question
export interface ValidationError {
  questionId: string;
  message: string;
}

// Form taking state
export interface FormTakingState {
  // Form data
  form: Form | null;
  questions: Question[];
  theme: Theme | null;

  // Navigation state
  currentIndex: number;
  direction: NavigationDirection;

  // Answers
  answers: AnswersMap;

  // Validation
  errors: Record<string, string>;

  // Submission state
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;

  // Form state
  isStarted: boolean;
  startTime: Date | null;
  endTime: Date | null;

  // Response tracking
  responseId: string | null;
}

// Action types for the reducer
export type FormTakingAction =
  | { type: "SET_FORM"; payload: { form: Form; questions: Question[] } }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "START_FORM" }
  | { type: "GO_NEXT" }
  | { type: "GO_PREVIOUS" }
  | { type: "GO_TO_QUESTION"; payload: number }
  | { type: "SET_ANSWER"; payload: { questionId: string; value: AnswerValue } }
  | { type: "SET_ERROR"; payload: { questionId: string; error: string } }
  | { type: "CLEAR_ERROR"; payload: string }
  | { type: "CLEAR_ALL_ERRORS" }
  | { type: "START_SUBMIT" }
  | { type: "SUBMIT_SUCCESS"; payload: string }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "RESET" };

// Initial state factory
export function createInitialFormTakingState(): FormTakingState {
  return {
    form: null,
    questions: [],
    theme: null,
    currentIndex: 0,
    direction: "forward",
    answers: {},
    errors: {},
    isSubmitting: false,
    isSubmitted: false,
    submitError: null,
    isStarted: false,
    startTime: null,
    endTime: null,
    responseId: null,
  };
}

// Props for form taking components
export interface FormTakingContainerProps {
  form: Form;
  questions: Question[];
  theme?: Theme;
  onSubmit?: (answers: AnswersMap) => Promise<void>;
  className?: string;
}

export interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  value: AnswerValue;
  error?: string;
  direction: NavigationDirection;
  onChange: (value: AnswerValue) => void;
  onContinue: () => void;
  disabled?: boolean;
}

export interface FormProgressBarProps {
  current: number;
  total: number;
  type?: "bar" | "dots" | "percentage" | "steps" | "none";
  position?: "top" | "bottom";
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export interface FormNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  showKeyboardHints?: boolean;
  className?: string;
}

export interface FormWelcomeScreenProps {
  title: string;
  description?: string;
  buttonText?: string;
  image?: string;
  video?: string;
  estimatedMinutes?: number;
  showEstimatedTime?: boolean;
  onStart: () => void;
  disabled?: boolean;
}

export interface FormThankYouScreenProps {
  title?: string;
  description?: string;
  showSocialShare?: boolean;
  socialMessage?: string;
  redirectUrl?: string;
  redirectDelay?: number;
  buttonText?: string;
  buttonUrl?: string;
  showConfetti?: boolean;
}

export interface FormSubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

// Screen types to identify special question types
export type ScreenType = "welcome" | "thankyou" | "question";

export function getScreenType(question: Question): ScreenType {
  switch (question.type) {
    case "welcome_screen":
      return "welcome";
    case "thank_you_screen":
      return "thankyou";
    default:
      return "question";
  }
}

// Check if a question requires an answer (is not a content block)
export function isAnswerableQuestion(question: Question): boolean {
  const contentBlockTypes = [
    "welcome_screen",
    "statement",
    "thank_you_screen",
    "redirect",
    "video_embed",
    "image_block",
  ];
  return !contentBlockTypes.includes(question.type);
}
