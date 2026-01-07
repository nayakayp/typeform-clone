/**
 * Form Taking Utilities
 * Helper functions for form taking experience
 */

import type { Question } from "@/types";
import type { AnswerValue, AnswersMap } from "./types";
import { isAnswerableQuestion } from "./types";

/**
 * Calculate form progress percentage
 * @param currentIndex - Current question index
 * @param totalQuestions - Total number of questions
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  currentIndex: number,
  totalQuestions: number
): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((currentIndex / totalQuestions) * 100);
}

/**
 * Calculate completion progress (answered questions / total answerable questions)
 * @param answers - Map of answers
 * @param questions - All questions
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionProgress(
  answers: AnswersMap,
  questions: Question[]
): number {
  const answerableQuestions = questions.filter(isAnswerableQuestion);
  if (answerableQuestions.length === 0) return 100;

  const answeredCount = answerableQuestions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null
  ).length;

  return Math.round((answeredCount / answerableQuestions.length) * 100);
}

/**
 * Check if a value is empty/unanswered
 */
export function isEmptyValue(value: AnswerValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Validate a required field
 * @param value - Answer value
 * @param question - Question object
 * @returns Error message or undefined if valid
 */
export function validateRequired(
  value: AnswerValue,
  question: Question
): string | undefined {
  // Check if question is required
  const isRequired =
    question.required || question.validations?.required === true;

  if (!isRequired) return undefined;

  if (isEmptyValue(value)) {
    return question.validations?.customError || "This field is required";
  }

  return undefined;
}

/**
 * Validate question answer based on type and validations
 * @param value - Answer value
 * @param question - Question object
 * @returns Error message or undefined if valid
 */
export function validateQuestion(
  value: AnswerValue,
  question: Question
): string | undefined {
  // First check required
  const requiredError = validateRequired(value, question);
  if (requiredError) return requiredError;

  // If empty and not required, it's valid
  if (isEmptyValue(value)) return undefined;

  const validations = question.validations || {};

  // Type-specific validations
  switch (question.type) {
    case "short_text":
    case "long_text": {
      const strValue = String(value);
      if (validations.minLength && strValue.length < validations.minLength) {
        return `Minimum ${validations.minLength} characters required`;
      }
      if (validations.maxLength && strValue.length > validations.maxLength) {
        return `Maximum ${validations.maxLength} characters allowed`;
      }
      if (validations.pattern) {
        const regex = new RegExp(validations.pattern);
        if (!regex.test(strValue)) {
          return validations.customError || "Invalid format";
        }
      }
      break;
    }

    case "email": {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(String(value))) {
        return "Please enter a valid email address";
      }
      break;
    }

    case "phone": {
      const phonePattern = /^\+?[1-9]\d{1,14}$/;
      const cleaned = String(value).replace(/[\s\-()]/g, "");
      if (!phonePattern.test(cleaned)) {
        return "Please enter a valid phone number";
      }
      break;
    }

    case "number": {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return "Please enter a valid number";
      }
      if (validations.min !== undefined && numValue < validations.min) {
        return `Must be at least ${validations.min}`;
      }
      if (validations.max !== undefined && numValue > validations.max) {
        return `Must be at most ${validations.max}`;
      }
      break;
    }

    case "url": {
      try {
        new URL(
          String(value).startsWith("http")
            ? String(value)
            : `https://${String(value)}`
        );
      } catch {
        return "Please enter a valid URL";
      }
      break;
    }

    case "checkboxes": {
      const arrayValue = Array.isArray(value) ? value : [];
      const settings = question.settings as {
        minSelections?: number;
        maxSelections?: number;
      };
      if (
        settings?.minSelections &&
        arrayValue.length < settings.minSelections
      ) {
        return `Please select at least ${settings.minSelections} options`;
      }
      if (
        settings?.maxSelections &&
        arrayValue.length > settings.maxSelections
      ) {
        return `Please select at most ${settings.maxSelections} options`;
      }
      break;
    }
  }

  return undefined;
}

/**
 * Format answer value for display
 */
export function formatAnswerForDisplay(
  value: AnswerValue,
  question: Question
): string {
  if (isEmptyValue(value)) return "";

  switch (question.type) {
    case "date":
      return value instanceof Date ? value.toLocaleDateString() : String(value);

    case "multiple_choice":
    case "dropdown": {
      const settings = question.settings as {
        options?: Array<{ id: string; label: string }>;
      };
      const option = settings?.options?.find((o) => o.id === value);
      return option?.label || String(value);
    }

    case "checkboxes":
    case "ranking": {
      const settings = question.settings as {
        options?: Array<{ id: string; label: string }>;
      };
      if (Array.isArray(value)) {
        return value
          .map((v) => {
            const option = settings?.options?.find((o) => o.id === v);
            return option?.label || String(v);
          })
          .join(", ");
      }
      return String(value);
    }

    case "yes_no":
      return value === true || value === "yes" ? "Yes" : "No";

    case "rating":
    case "opinion_scale":
    case "nps":
      return String(value);

    default:
      return String(value);
  }
}

/**
 * Format answer for submission to API
 */
export function formatAnswerForSubmission(
  value: AnswerValue,
  question: Question
): {
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  dateValue?: Date;
  jsonValue?: unknown;
} {
  if (isEmptyValue(value)) {
    return {};
  }

  switch (question.type) {
    case "short_text":
    case "long_text":
    case "email":
    case "phone":
    case "url":
    case "time":
      return { textValue: String(value) };

    case "number":
    case "rating":
    case "opinion_scale":
    case "nps":
      return { numberValue: Number(value) };

    case "yes_no":
      return { booleanValue: value === true || value === "yes" };

    case "date":
      return {
        dateValue: value instanceof Date ? value : new Date(String(value)),
      };

    case "multiple_choice":
    case "dropdown":
      return { textValue: String(value) };

    case "checkboxes":
    case "ranking":
    case "picture_choice":
    case "matrix":
      return { jsonValue: value };

    default:
      if (typeof value === "object") {
        return { jsonValue: value };
      }
      return { textValue: String(value) };
  }
}

/**
 * Get answerable questions (filter out content blocks)
 */
export function getAnswerableQuestions(questions: Question[]): Question[] {
  return questions.filter(isAnswerableQuestion);
}

/**
 * Get next question index, considering logic jumps
 * For now, simple linear navigation. Logic jumps can be added later.
 */
export function getNextQuestionIndex(
  currentIndex: number,
  questions: Question[],
  _answers: AnswersMap
): number {
  // Simple linear navigation for now
  // TODO: Implement logic jumps based on answers
  return Math.min(currentIndex + 1, questions.length - 1);
}

/**
 * Get previous question index
 */
export function getPreviousQuestionIndex(currentIndex: number): number {
  return Math.max(currentIndex - 1, 0);
}

/**
 * Calculate estimated completion time based on question types
 */
export function estimateCompletionTime(questions: Question[]): number {
  const answerableQuestions = getAnswerableQuestions(questions);

  // Rough estimates per question type (in seconds)
  const timePerType: Record<string, number> = {
    short_text: 15,
    long_text: 45,
    email: 10,
    phone: 10,
    number: 8,
    url: 15,
    date: 10,
    time: 8,
    multiple_choice: 8,
    checkboxes: 12,
    dropdown: 8,
    yes_no: 5,
    rating: 5,
    opinion_scale: 8,
    nps: 8,
    picture_choice: 10,
    ranking: 20,
    matrix: 30,
    file_upload: 30,
    signature: 20,
  };

  const totalSeconds = answerableQuestions.reduce((acc, q) => {
    return acc + (timePerType[q.type] || 10);
  }, 0);

  return Math.ceil(totalSeconds / 60); // Return in minutes
}

/**
 * Generate a unique respondent ID
 */
export function generateRespondentId(): string {
  return `resp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
