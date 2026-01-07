import {
  ExportOptions,
  QuestionData,
  ResponseData,
  buildExportData,
  formatDateValue,
} from "./utils";

// Generate Excel-compatible XML Spreadsheet
// This is a simpler approach that doesn't require xlsx library
export function toExcelXML(
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): string {
  const { headers, rows } = buildExportData(questionsList, responsesList, options);

  const escapeXML = (value: string): string => {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Build Excel XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Complete">
      <Interior ss:Color="#D4EDDA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Partial">
      <Interior ss:Color="#FFF3CD" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Responses">
    <Table>
      <Row>
        ${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`).join("\n        ")}
      </Row>
      ${rows
        .map(
          (row, i) => `<Row>
        ${row
          .map(
            (cell, j) =>
              `<Cell${j === 2 ? ` ss:StyleID="${cell === "Complete" ? "Complete" : "Partial"}"` : ""}><Data ss:Type="String">${escapeXML(cell)}</Data></Cell>`
          )
          .join("\n        ")}
      </Row>`
        )
        .join("\n      ")}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Summary">
    <Table>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Question</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Response Count</Data></Cell>
      </Row>
      ${questionsList
        .map((q) => {
          const count = responsesList.filter(
            (r) => r.answers[q.id] !== undefined && r.answers[q.id] !== null && r.answers[q.id] !== ""
          ).length;
          return `<Row>
        <Cell><Data ss:Type="String">${escapeXML(q.title)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(q.type)}</Data></Cell>
        <Cell><Data ss:Type="Number">${count}</Data></Cell>
      </Row>`;
        })
        .join("\n      ")}
    </Table>
  </Worksheet>
</Workbook>`;

  return xml;
}

// Generate Excel export for server-side
export async function generateExcelExport(
  questionsList: QuestionData[],
  responsesList: ResponseData[],
  options: ExportOptions
): Promise<{ content: string; filename: string; mimeType: string }> {
  const excel = toExcelXML(questionsList, responsesList, options);

  return {
    content: excel,
    filename: `responses-${new Date().toISOString().split("T")[0]}.xls`,
    mimeType: "application/vnd.ms-excel",
  };
}
