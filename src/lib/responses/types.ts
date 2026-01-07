import type {
  Response as DbResponse,
  Answer as DbAnswer,
} from "@/lib/db/schema/responses";
import type { Question } from "@/lib/db/schema/questions";

// Response status enum
export type ResponseStatus = "in_progress" | "completed" | "partial";

// Extended answer type with question info
export interface AnswerWithQuestion extends DbAnswer {
  question?: Question;
  answeredAt?: Date;
}

// Extended response type with answers and form info
export interface ResponseWithAnswers extends DbResponse {
  answers: AnswerWithQuestion[];
  form?: {
    id: string;
    title: string;
    slug: string;
  };
}

// Response metadata for display
export interface ResponseMetadata {
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

// View mode for responses dashboard
export type ResponseViewMode = "table" | "individual" | "summary";

// Filters for responses
export interface ResponseFilters {
  status?: ResponseStatus | "all";
  dateFrom?: Date | null;
  dateTo?: Date | null;
  search?: string;
  formId?: string;
}

// Sort options for responses
export type ResponseSortField =
  | "startedAt"
  | "completedAt"
  | "lastActivityAt"
  | "status";
export type SortDirection = "asc" | "desc";

export interface ResponseSort {
  field: ResponseSortField;
  direction: SortDirection;
}

// Pagination
export interface ResponsePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Response summary statistics
export interface ResponseSummary {
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  partialResponses: number;
  completionRate: number;
  averageCompletionTime: number; // in seconds
  responsesOverTime: {
    date: string;
    count: number;
  }[];
}

// Answer value types for display
export type AnswerValueType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "object"
  | "file"
  | "unknown";

// Formatted answer for display
export interface FormattedAnswer {
  questionId: string;
  questionTitle: string;
  questionType: string;
  value: unknown;
  displayValue: string;
  valueType: AnswerValueType;
  answeredAt?: Date;
}

// Response card display data
export interface ResponseCardData {
  id: string;
  formId: string;
  formTitle?: string;
  status: ResponseStatus;
  startedAt: Date;
  completedAt?: Date | null;
  lastActivityAt: Date;
  respondentId?: string | null;
  email?: string | null;
  metadata: ResponseMetadata;
  answersCount: number;
  completionTime?: number; // in seconds
}

// Bulk action types
export type BulkAction = "delete" | "export";

// Export format
export type ExportFormat = "csv" | "json" | "xlsx";
