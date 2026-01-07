import {
  ExportOptions,
  QuestionData,
  ResponseData,
  buildExportData,
} from "./utils";

// Convert data to CSV string
export function toCSV(
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): string {
  const { headers, rows } = buildExportData(questionsList, responsesList, options);

  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (
      value.includes(",") ||
      value.includes('"') ||
      value.includes("\n") ||
      value.includes("\r")
    ) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Build CSV string
  const csvLines = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ];

  return csvLines.join("\n");
}

// Generate CSV export for server-side
export async function generateCSVExport(
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): Promise<{ content: string; filename: string; mimeType: string }> {
  const csv = toCSV(questionsList, responsesList, options);

  return {
    content: csv,
    filename: `responses-${new Date().toISOString().split("T")[0]}.csv`,
    mimeType: "text/csv",
  };
}
