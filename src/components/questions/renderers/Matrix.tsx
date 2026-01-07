"use client";

import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionRendererProps, MatrixSettings } from "../types";

type MatrixValue = Record<string, string | string[]>;

export function Matrix({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<MatrixValue>) {
  const settings = question.settings as MatrixSettings;
  const rows = settings?.rows || [];
  const columns = settings?.columns || [];
  const allowMultiplePerRow = settings?.allowMultiplePerRow ?? false;

  const currentValue: MatrixValue = value || {};

  const handleSingleChange = (rowId: string, columnId: string) => {
    onChange({
      ...currentValue,
      [rowId]: columnId,
    });
  };

  const handleMultipleChange = (
    rowId: string,
    columnId: string,
    checked: boolean
  ) => {
    const currentRowValue = (currentValue[rowId] as string[]) || [];
    const newRowValue = checked
      ? [...currentRowValue, columnId]
      : currentRowValue.filter((id) => id !== columnId);

    onChange({
      ...currentValue,
      [rowId]: newRowValue,
    });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left"></th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="p-2 text-center text-sm font-medium"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn("border-t", rowIndex % 2 === 0 && "bg-muted/30")}
              >
                <td className="p-3 text-sm font-medium">{row.label}</td>
                {columns.map((column) => (
                  <td key={column.id} className="p-3 text-center">
                    {allowMultiplePerRow ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={
                            Array.isArray(currentValue[row.id]) &&
                            (currentValue[row.id] as string[]).includes(
                              column.id
                            )
                          }
                          onCheckedChange={(checked) =>
                            handleMultipleChange(
                              row.id,
                              column.id,
                              checked as boolean
                            )
                          }
                          disabled={disabled}
                        />
                      </div>
                    ) : (
                      <RadioGroup
                        value={(currentValue[row.id] as string) || ""}
                        onValueChange={(val) => handleSingleChange(row.id, val)}
                        disabled={disabled}
                        className="flex justify-center"
                      >
                        <RadioGroupItem
                          value={column.id}
                          className="border-2"
                        />
                      </RadioGroup>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
