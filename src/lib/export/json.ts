import {
  ExportOptions,
  QuestionData,
  ResponseData,
  formatDateValue,
  formatAnswerValue,
} from "./utils";

// JSON export structure
interface JSONExport {
  exportedAt: string;
  formId: string;
  totalResponses: number;
  questions: {
    id: string;
    title: string;
    type: string;
    order: number;
  }[];
  responses: {
    id: string;
    submittedAt: string | null;
    startedAt: string;
    isComplete: boolean;
    answers: {
      questionId: string;
      questionTitle: string;
      value: unknown;
      formattedValue: string;
    }[];
    metadata?: {
      ipAddress?: string;
      device?: string;
      userAgent?: string;
    };
  }[];
}

// Convert data to JSON export structure
export function toJSON(
  formId: string,
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): JSONExport {
  // Filter questions if specific ones requested
  const filteredQuestions = options.questionIds
    ? questionsList.filter((q) => options.questionIds!.includes(q.id))
    : questionsList;

  const questionMap = new Map(filteredQuestions.map((q) => [q.id, q]));

  return {
    exportedAt: new Date().toISOString(),
    formId,
    totalResponses: responsesList.length,
    questions: filteredQuestions.map((q) => ({
      id: q.id,
      title: q.title,
      type: q.type,
      order: q.order,
    })),
    responses: responsesList.map((r) => ({
      id: r.id,
      submittedAt: r.submittedAt?.toISOString() || null,
      startedAt: r.startedAt.toISOString(),
      isComplete: r.isComplete,
      answers: filteredQuestions.map((q) => ({
        questionId: q.id,
        questionTitle: q.title,
        value: r.answers[q.id],
        formattedValue: formatAnswerValue(r.answers[q.id], q.type),
      })),
      ...(options.includeMetadata && {
        metadata: {
          ipAddress: r.metadata.ipAddress,
          device: r.metadata.device,
          userAgent: r.metadata.userAgent,
        },
      }),
    })),
  };
}

// Generate JSON export for server-side
export async function generateJSONExport(
  formId: string,
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): Promise<{ content: string; filename: string; mimeType: string }> {
  const json = toJSON(formId, questionsList, responsesList, options);

  return {
    content: JSON.stringify(json, null, 2),
    filename: `responses-${new Date().toISOString().split("T")[0]}.json`,
    mimeType: "application/json",
  };
}
