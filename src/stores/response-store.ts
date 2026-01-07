import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface Answer {
  questionId: string;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  selectedOptions?: string[];
  fileUrl?: string;
  rating?: number;
  date?: string;
}

export interface Question {
  id: string;
  type: string;
  required: boolean;
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface ResponseState {
  // Form context
  formId: string | null;
  sessionId: string | null;

  // Answers
  answers: Record<string, Answer>;

  // Navigation
  currentQuestionIndex: number;
  questionOrder: string[];

  // Progress
  startedAt: Date | null;
  completedAt: Date | null;

  // Errors
  errors: Record<string, string>;
}

interface ResponseActions {
  // Initialization
  initSession: (formId: string, questionIds: string[]) => void;
  resetSession: () => void;

  // Answer management
  setAnswer: (questionId: string, answer: Partial<Answer>) => void;
  clearAnswer: (questionId: string) => void;

  // Validation
  validate: (questions: Question[]) => Record<string, string>;
  validateField: (
    questionId: string,
    question: Partial<Question>
  ) => string | null;
  clearError: (questionId: string) => void;
  clearAllErrors: () => void;

  // Navigation
  goToQuestion: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;

  // Progress
  getCompletionPercentage: (questionIds: string[]) => number;
  markComplete: () => void;

  // Getters
  getAnswer: (questionId: string) => Answer | undefined;
  hasAnswer: (questionId: string) => boolean;
}

const initialState: ResponseState = {
  formId: null,
  sessionId: null,
  answers: {},
  currentQuestionIndex: 0,
  questionOrder: [],
  startedAt: null,
  completedAt: null,
  errors: {},
};

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

export const useResponseStore = create<ResponseState & ResponseActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        initSession: (formId, questionIds) => {
          set((state) => {
            state.formId = formId;
            state.sessionId = crypto.randomUUID();
            state.questionOrder = questionIds;
            state.currentQuestionIndex = 0;
            state.startedAt = new Date();
            state.completedAt = null;
            state.answers = {};
            state.errors = {};
          });
        },

        resetSession: () => {
          set(initialState);
        },

        setAnswer: (questionId, answer) => {
          set((state) => {
            const existing = state.answers[questionId] || { questionId };
            state.answers[questionId] = { ...existing, ...answer };
            // Clear any error when answer is set
            delete state.errors[questionId];
          });
        },

        clearAnswer: (questionId) => {
          set((state) => {
            delete state.answers[questionId];
          });
        },

        validate: (questions) => {
          const state = get();
          const errors: Record<string, string> = {};

          for (const question of questions) {
            const error = state.validateField(question.id, question);
            if (error) {
              errors[question.id] = error;
            }
          }

          set((s) => {
            s.errors = errors;
          });

          return errors;
        },

        validateField: (questionId, question) => {
          const state = get();
          const answer = state.answers[questionId];

          // Check required
          if (question.required) {
            if (!answer) {
              return "This field is required";
            }

            const hasValue =
              answer.textValue !== undefined ||
              answer.numberValue !== undefined ||
              answer.booleanValue !== undefined ||
              (answer.selectedOptions && answer.selectedOptions.length > 0) ||
              answer.fileUrl !== undefined ||
              answer.rating !== undefined ||
              answer.date !== undefined;

            if (!hasValue) {
              return "This field is required";
            }

            // Check empty string
            if (answer.textValue !== undefined && answer.textValue.trim() === "") {
              return "This field is required";
            }
          }

          // Type-specific validations
          if (answer?.textValue) {
            const value = answer.textValue;

            // Email validation
            if (question.type === "email" && !validateEmail(value)) {
              return "Invalid email address";
            }

            // URL validation
            if (question.type === "website" && !validateUrl(value)) {
              return "Invalid URL";
            }

            // Phone validation
            if (question.type === "phone" && !validatePhone(value)) {
              return "Invalid phone number";
            }

            // Length validations
            if (question.validations?.minLength && value.length < question.validations.minLength) {
              return `Minimum ${question.validations.minLength} characters required`;
            }

            if (question.validations?.maxLength && value.length > question.validations.maxLength) {
              return `Maximum ${question.validations.maxLength} characters allowed`;
            }

            // Pattern validation
            if (question.validations?.pattern) {
              const regex = new RegExp(question.validations.pattern);
              if (!regex.test(value)) {
                return "Invalid format";
              }
            }
          }

          // Number validations
          if (answer?.numberValue !== undefined) {
            const value = answer.numberValue;

            if (question.validations?.min !== undefined && value < question.validations.min) {
              return `Minimum value is ${question.validations.min}`;
            }

            if (question.validations?.max !== undefined && value > question.validations.max) {
              return `Maximum value is ${question.validations.max}`;
            }
          }

          // Rating validation
          if (answer?.rating !== undefined) {
            if (answer.rating < 1 || answer.rating > 10) {
              return "Rating must be between 1 and 10";
            }
          }

          return null;
        },

        clearError: (questionId) => {
          set((state) => {
            delete state.errors[questionId];
          });
        },

        clearAllErrors: () => {
          set((state) => {
            state.errors = {};
          });
        },

        goToQuestion: (index) => {
          set((state) => {
            if (index >= 0 && index < state.questionOrder.length) {
              state.currentQuestionIndex = index;
            }
          });
        },

        goToNext: () => {
          set((state) => {
            if (state.currentQuestionIndex < state.questionOrder.length - 1) {
              state.currentQuestionIndex += 1;
            }
          });
        },

        goToPrevious: () => {
          set((state) => {
            if (state.currentQuestionIndex > 0) {
              state.currentQuestionIndex -= 1;
            }
          });
        },

        getCompletionPercentage: (questionIds) => {
          const state = get();
          if (questionIds.length === 0) return 100;

          const answeredCount = questionIds.filter((id) => state.hasAnswer(id)).length;
          return Math.round((answeredCount / questionIds.length) * 100);
        },

        markComplete: () => {
          set((state) => {
            state.completedAt = new Date();
          });
        },

        getAnswer: (questionId) => {
          const state = get();
          return state.answers[questionId];
        },

        hasAnswer: (questionId) => {
          const state = get();
          const answer = state.answers[questionId];
          if (!answer) return false;

          return (
            answer.textValue !== undefined ||
            answer.numberValue !== undefined ||
            answer.booleanValue !== undefined ||
            (answer.selectedOptions && answer.selectedOptions.length > 0) ||
            answer.fileUrl !== undefined ||
            answer.rating !== undefined ||
            answer.date !== undefined
          );
        },
      })),
      {
        name: "form-response",
        partialize: (state) => ({
          formId: state.formId,
          sessionId: state.sessionId,
          answers: state.answers,
          currentQuestionIndex: state.currentQuestionIndex,
          questionOrder: state.questionOrder,
          startedAt: state.startedAt,
        }),
      }
    ),
    { name: "response-store" }
  )
);
