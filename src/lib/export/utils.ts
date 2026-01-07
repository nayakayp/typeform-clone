import { db } from "@/lib/db";
import { forms, questions, responses, answers } from "@/lib/db/schema";
import { eq, and, inArray, desc, gte, lte } from "drizzle-orm";

// Types
export type ExportFormat = "csv" | "excel" | "json";

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  dateFormat: string;
  questionIds?: string[];
  responseIds?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ResponseData {
  id: string;
  submittedAt: Date | null;
  startedAt: Date;
  isComplete: boolean;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    country?: string;
  };
  answers: Record<string, unknown>;
}

export interface QuestionData {
  id: string;
  title: string;
  type: string;
  order: number;
}

// Helper to format answer values for export
export function formatAnswerValue(value: unknown, questionType: string): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    // Handle complex types like file uploads, matrix, etc.
    return JSON.stringify(value);
  }

  return String(value);
}

// Helper to format date
export function formatDateValue(date: Date | null, format: string): string {
  if (!date) return "";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  // Common format patterns
  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD HH:mm":
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case "YYYY-MM-DD HH:mm:ss":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return d.toISOString();
  }
}

// Fetch form questions
export async function fetchQuestions(formId: string): Promise<QuestionData[]> {
  const formQuestions = await db.query.questions.findMany({
    where: eq(questions.formId, formId),
    orderBy: [questions.order],
  });

  return formQuestions.map((q) => ({
    id: q.id,
    title: (q.title as string) || `Question ${q.order + 1}`,
    type: q.type,
    order: q.order,
  }));
}

// Fetch responses with their answers
export async function fetchResponses(
  formId: string,
  options: Partial<ExportOptions> = {}
): Promise<ResponseData[]> {
  // Build where conditions
  const conditions = [eq(responses.formId, formId)];

  if (options.responseIds && options.responseIds.length > 0) {
    conditions.push(inArray(responses.id, options.responseIds));
  }

  if (options.dateRange?.from) {
    conditions.push(gte(responses.startedAt, options.dateRange.from));
  }

  if (options.dateRange?.to) {
    conditions.push(lte(responses.startedAt, options.dateRange.to));
  }

  const formResponses = await db.query.responses.findMany({
    where: and(...conditions),
    orderBy: [desc(responses.startedAt)],
    with: {
      answers: true,
    },
  });

  return formResponses.map((r) => {
    // Convert answers array to a map by questionId
    const answersMap: Record<string, unknown> = {};
    for (const answer of r.answers) {
      answersMap[answer.questionId] = answer.value;
    }

    return {
      id: r.id,
      submittedAt: r.completedAt,
      startedAt: r.startedAt,
      isComplete: r.isComplete,
      metadata: {
        ipAddress: r.ipAddress || undefined,
        userAgent: r.userAgent || undefined,
        device: detectDevice(r.userAgent || ""),
        country: undefined, // Would need geo lookup
      },
      answers: answersMap,
    };
  });
}

// Detect device type from user agent
function detectDevice(userAgent: string): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "Mobile";
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "Tablet";
  }
  return "Desktop";
}

// Build export data structure
export function buildExportData(
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): {
  headers: string[];
  rows: string[][];
} {
  // Filter questions if specific ones requested
  const filteredQuestions = options.questionIds
    ? questionsList.filter((q) => options.questionIds!.includes(q.id))
    : questionsList;

  // Build headers
  const headers = [
    "Response ID",
    "Submitted At",
    "Status",
    ...filteredQuestions.map((q) => q.title),
  ];

  if (options.includeMetadata) {
    headers.push("IP Address", "Device", "User Agent");
  }

  // Build rows
  const rows = responsesList.map((response) => {
    const row = [
      response.id,
      formatDateValue(response.submittedAt, options.dateFormat),
      response.isComplete ? "Complete" : "Partial",
      ...filteredQuestions.map((q) =>
        formatAnswerValue(response.answers[q.id], q.type)
      ),
    ];

    if (options.includeMetadata) {
      row.push(
        response.metadata.ipAddress || "",
        response.metadata.device || "",
        response.metadata.userAgent || ""
      );
    }

    return row;
  });

  return { headers, rows };
}
