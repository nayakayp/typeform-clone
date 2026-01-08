import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface MatrixPreviewProps {
  question: BuilderQuestion;
}

export function MatrixPreview({ question }: MatrixPreviewProps) {
  // Get rows and columns from settings/options
  const rows = question.settings?.matrixRows || ["Row 1", "Row 2"];
  const columns = question.settings?.matrixColumns || [
    "Column 1",
    "Column 2",
    "Column 3",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2"></th>
            {columns.map((col, i) => (
              <th
                key={i}
                className="p-2 text-center font-medium text-muted-foreground"
              >
                <input
                  className="w-full text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  defaultValue={col}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-muted">
              <td className="p-2 font-medium">
                <input
                  className="bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  defaultValue={row}
                />
              </td>
              {columns.map((_, colIndex) => (
                <td key={colIndex} className="p-2 text-center">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 mx-auto" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" size="sm">
          <Plus className="h-3 w-3 mr-1" /> Add row
        </Button>
        <Button variant="ghost" size="sm">
          <Plus className="h-3 w-3 mr-1" /> Add column
        </Button>
      </div>
    </div>
  );
}
