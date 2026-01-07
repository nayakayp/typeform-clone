import { formatDistanceToNow, format, differenceInSeconds } from "date-fns";
import type {
  ResponseStatus,
  AnswerValueType,
  FormattedAnswer,
  ResponseMetadata,
  ResponseWithAnswers,
  ResponseCardData,
} from "./types";
import type { Answer } from "@/lib/db/schema/responses";
import { getQuestionTypeLabel } from "@/lib/question-types";

/**
 * Format a response status for display
 */
export function formatResponseStatus(status: ResponseStatus): string {
  const statusLabels: Record<ResponseStatus, string> = {
    in_progress: "In Progress",
    completed: "Completed",
    partial: "Partial",
  };
  return statusLabels[status] || status;
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status: ResponseStatus
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<
    ResponseStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    completed: "default",
    in_progress: "secondary",
    partial: "outline",
  };
  return variants[status] || "outline";
}

/**
 * Calculate response duration in seconds
 */
export function calculateResponseDuration(
  startedAt: Date | string,
  completedAt?: Date | string | null
): number | null {
  if (!completedAt) return null;

  const start = new Date(startedAt);
  const end = new Date(completedAt);

  return differenceInSeconds(end, start);
}

/**
 * Format duration for display (e.g., "2m 30s", "1h 15m")
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "-";

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Format date for display
 */
export function formatResponseDate(date: Date | string | null): string {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Parse user agent string to extract device, browser, and OS info
 */
export function parseUserAgent(userAgent: string | null): {
  device: string;
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { device: "Unknown", browser: "Unknown", os: "Unknown" };
  }

  // Simple parsing - in production you might use a library like ua-parser-js
  let device = "Desktop";
  let browser = "Unknown";
  let os = "Unknown";

  // Device detection
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    device = /iPad|Tablet/i.test(userAgent) ? "Tablet" : "Mobile";
  }

  // Browser detection
  if (/Firefox/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Edg/i.test(userAgent)) {
    browser = "Edge";
  } else if (/Chrome/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari/i.test(userAgent)) {
    browser = "Safari";
  } else if (/Opera|OPR/i.test(userAgent)) {
    browser = "Opera";
  }

  // OS detection
  if (/Windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/Mac OS/i.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
  } else if (/Android/i.test(userAgent)) {
    os = "Android";
  } else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
  }

  return { device, browser, os };
}

/**
 * Determine the value type of an answer
 */
export function getAnswerValueType(answer: Answer): AnswerValueType {
  if (answer.fileUrls && answer.fileUrls.length > 0) {
    return "file";
  }
  if (answer.textValue !== null) {
    return "text";
  }
  if (answer.numberValue !== null) {
    return "number";
  }
  if (answer.booleanValue !== null) {
    return "boolean";
  }
  if (answer.dateValue !== null) {
    return "date";
  }
  if (answer.jsonValue !== null) {
    if (Array.isArray(answer.jsonValue)) {
      return "array";
    }
    return "object";
  }
  return "unknown";
}

/**
 * Get the actual value from an answer
 */
export function getAnswerValue(answer: Answer): unknown {
  if (answer.textValue !== null) return answer.textValue;
  if (answer.numberValue !== null) return Number(answer.numberValue);
  if (answer.booleanValue !== null) return answer.booleanValue;
  if (answer.dateValue !== null) return answer.dateValue;
  if (answer.jsonValue !== null) return answer.jsonValue;
  if (answer.fileUrls && answer.fileUrls.length > 0) return answer.fileUrls;
  return null;
}

/**
 * Format an answer value for display
 */
export function formatAnswerValue(
  value: unknown,
  valueType: AnswerValueType
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  switch (valueType) {
    case "text":
      return String(value);

    case "number":
      return String(value);

    case "boolean":
      return value ? "Yes" : "No";

    case "date":
      return formatResponseDate(value as Date);

    case "array":
      if (Array.isArray(value)) {
        return value
          .map((v) =>
            typeof v === "object"
              ? (v as { label?: string }).label || JSON.stringify(v)
              : String(v)
          )
          .join(", ");
      }
      return String(value);

    case "object":
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);

    case "file":
      if (Array.isArray(value)) {
        return value
          .map((f) => (f as { name?: string }).name || "File")
          .join(", ");
      }
      return "File";

    default:
      return String(value);
  }
}

/**
 * Format a complete answer for display
 */
export function formatAnswer(
  answer: Answer,
  questionTitle: string,
  questionType: string
): FormattedAnswer {
  const valueType = getAnswerValueType(answer);
  const value = getAnswerValue(answer);
  const displayValue = formatAnswerValue(value, valueType);

  return {
    questionId: answer.questionId,
    questionTitle,
    questionType: getQuestionTypeLabel(questionType),
    value,
    displayValue,
    valueType,
    answeredAt: answer.createdAt,
  };
}

/**
 * Extract metadata from a response
 */
export function extractResponseMetadata(
  response: ResponseWithAnswers
): ResponseMetadata {
  return {
    device: response.device,
    browser: response.browser,
    os: response.os,
    country: response.country,
    city: response.city,
    ipAddress: response.ipAddress,
    userAgent: response.userAgent,
    utmSource: response.utmSource,
    utmMedium: response.utmMedium,
    utmCampaign: response.utmCampaign,
  };
}

/**
 * Convert a response to card display data
 */
export function responseToCardData(
  response: ResponseWithAnswers
): ResponseCardData {
  const completionTime = calculateResponseDuration(
    response.startedAt,
    response.completedAt
  );

  return {
    id: response.id,
    formId: response.formId,
    formTitle: response.form?.title,
    status: response.status as ResponseStatus,
    startedAt: response.startedAt,
    completedAt: response.completedAt,
    lastActivityAt: response.lastActivityAt,
    respondentId: response.respondentId,
    email: response.email,
    metadata: extractResponseMetadata(response),
    answersCount: response.answers?.length || 0,
    completionTime: completionTime ?? undefined,
  };
}

/**
 * Calculate completion rate
 */
export function calculateCompletionRate(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get location string from response
 */
export function getLocationString(
  city: string | null,
  country: string | null
): string {
  if (city && country) {
    return `${city}, ${country}`;
  }
  if (country) {
    return country;
  }
  if (city) {
    return city;
  }
  return "Unknown";
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate a respondent identifier for display
 */
export function getRespondentIdentifier(
  email?: string | null,
  respondentId?: string | null
): string {
  if (email) return email;
  if (respondentId) return `Anonymous (${respondentId.slice(0, 8)})`;
  return "Anonymous";
}
