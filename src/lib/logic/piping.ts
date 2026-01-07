import type { PipingToken } from "./types";
import type { BuilderQuestion } from "@/types/builder";

/**
 * Parsed piping token with position information
 */
export interface ParsedToken {
  token: PipingToken;
  raw: string;
  start: number;
  end: number;
}

/**
 * Piping context for interpolation
 */
export interface PipingContext {
  responses: Record<string, unknown>;
  hiddenFields?: Record<string, string>;
  calculators?: Record<string, number>;
  questions?: BuilderQuestion[];
}

/**
 * Token pattern for piping syntax: {{id}} or {{id:format}}
 */
const TOKEN_PATTERN = /\{\{([^}:]+)(?::([^}]+))?\}\}/g;

/**
 * Mention pattern for @mention syntax in editor: @[Label](id)
 */
const MENTION_PATTERN = /@\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Parse piping tokens from text
 */
export function parsePipingTokens(text: string): ParsedToken[] {
  if (!text) return [];

  const tokens: ParsedToken[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  TOKEN_PATTERN.lastIndex = 0;

  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const [raw, id, format] = match;
    tokens.push({
      token: {
        type: "question", // Default type, can be refined
        id,
        format: (format as PipingToken["format"]) || "default",
      },
      raw,
      start: match.index,
      end: match.index + raw.length,
    });
  }

  return tokens;
}

/**
 * Parse mention tokens from text (for editor)
 */
export function parseMentionTokens(text: string): ParsedToken[] {
  if (!text) return [];

  const tokens: ParsedToken[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  MENTION_PATTERN.lastIndex = 0;

  while ((match = MENTION_PATTERN.exec(text)) !== null) {
    const [raw, , id] = match;
    tokens.push({
      token: {
        type: "question",
        id,
        format: "default",
      },
      raw,
      start: match.index,
      end: match.index + raw.length,
    });
  }

  return tokens;
}

/**
 * Convert mention syntax to piping syntax
 * @[Label](id) -> {{id}}
 */
export function mentionsToPiping(text: string): string {
  if (!text) return "";
  return text.replace(MENTION_PATTERN, (_, __, id) => `{{${id}}}`);
}

/**
 * Convert piping syntax to mention syntax for editor display
 * {{id}} -> @[Label](id)
 */
export function pipingToMentions(
  text: string,
  questions: BuilderQuestion[]
): string {
  if (!text) return "";

  return text.replace(TOKEN_PATTERN, (match, id) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      const label = question.title || `Question ${question.order + 1}`;
      return `@[${label}](${id})`;
    }
    return match;
  });
}

/**
 * Replace piping tokens with actual values
 */
export function interpolatePiping(
  text: string,
  context: PipingContext
): string {
  if (!text) return "";

  return text.replace(TOKEN_PATTERN, (match, id, format) => {
    const value = getValueForId(id, context);
    return formatValue(value, (format as PipingToken["format"]) || "default");
  });
}

/**
 * Get value for a given ID from context
 */
function getValueForId(id: string, context: PipingContext): string {
  // Check responses first
  if (context.responses[id] !== undefined) {
    const response = context.responses[id];

    if (response === null) return "";

    // Handle array responses (checkboxes, etc.)
    if (Array.isArray(response)) {
      // Try to get labels from questions if available
      if (context.questions) {
        const question = context.questions.find((q) => q.id === id);
        if (question?.options) {
          return response
            .map((optionId) => {
              const option = question.options?.find((o) => o.id === optionId);
              return option?.label || optionId;
            })
            .join(", ");
        }
      }
      return response.join(", ");
    }

    // For single selection, try to get label
    if (context.questions) {
      const question = context.questions.find((q) => q.id === id);
      if (question?.options) {
        const option = question.options.find((o) => o.id === response);
        if (option?.label) return option.label;
      }
    }

    return String(response);
  }

  // Check hidden fields
  if (context.hiddenFields?.[id] !== undefined) {
    return context.hiddenFields[id];
  }

  // Check calculators
  if (context.calculators?.[id] !== undefined) {
    return String(context.calculators[id]);
  }

  // Return empty string if not found
  return "";
}

/**
 * Format a value based on format type
 */
export function formatValue(
  value: string,
  format: PipingToken["format"]
): string {
  if (!value) return value;

  switch (format) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "capitalize":
      return value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    default:
      return value;
  }
}

/**
 * Extract all referenced question IDs from text
 */
export function extractReferencedQuestionIds(text: string): string[] {
  const tokens = parsePipingTokens(text);
  return tokens.map((t) => t.token.id);
}

/**
 * Validate piping tokens against available questions
 */
export function validatePipingTokens(
  text: string,
  availableQuestionIds: string[]
): { valid: boolean; invalidIds: string[] } {
  const tokens = parsePipingTokens(text);
  const invalidIds: string[] = [];

  for (const { token } of tokens) {
    if (!availableQuestionIds.includes(token.id)) {
      invalidIds.push(token.id);
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
  };
}

/**
 * Create a piping token string
 */
export function createPipingToken(
  id: string,
  format?: PipingToken["format"]
): string {
  if (format && format !== "default") {
    return `{{${id}:${format}}}`;
  }
  return `{{${id}}}`;
}

/**
 * Check if text contains any piping tokens
 */
export function hasPipingTokens(text: string): boolean {
  if (!text) return false;
  TOKEN_PATTERN.lastIndex = 0;
  return TOKEN_PATTERN.test(text);
}

/**
 * Get suggested questions for piping (questions that come before the current one)
 */
export function getAvailableQuestionsForPiping(
  questions: BuilderQuestion[],
  currentQuestionId: string
): BuilderQuestion[] {
  const currentQuestion = questions.find((q) => q.id === currentQuestionId);
  if (!currentQuestion) return [];

  // Only questions that come before the current question can be piped
  return questions
    .filter((q) => q.order < currentQuestion.order)
    .filter((q) => !isContentBlockType(q.type))
    .sort((a, b) => a.order - b.order);
}

/**
 * Check if a question type is a content block (non-input)
 */
function isContentBlockType(type: string): boolean {
  return [
    "welcome_screen",
    "statement",
    "thank_you_screen",
    "redirect",
    "video_embed",
    "image_block",
  ].includes(type);
}

/**
 * Generate a preview of interpolated text (with placeholders for missing values)
 */
export function previewInterpolation(
  text: string,
  context: PipingContext
): string {
  if (!text) return "";

  return text.replace(TOKEN_PATTERN, (match, id, format) => {
    const value = getValueForId(id, context);

    if (!value) {
      // Show placeholder for missing values
      if (context.questions) {
        const question = context.questions.find((q) => q.id === id);
        if (question) {
          return `[${question.title || `Question ${question.order + 1}`}]`;
        }
      }
      return `[${id}]`;
    }

    return formatValue(value, (format as PipingToken["format"]) || "default");
  });
}
