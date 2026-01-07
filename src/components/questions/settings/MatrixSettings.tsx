"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { MatrixSettings, MatrixRow, MatrixColumn } from "../types";

interface MatrixSettingsProps {
  settings: MatrixSettings;
  onChange: (settings: MatrixSettings) => void;
}

export function MatrixSettingsPanel({
  settings,
  onChange,
}: MatrixSettingsProps) {
  const updateSetting = <K extends keyof MatrixSettings>(
    key: K,
    value: MatrixSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const rows = settings.rows || [];
  const columns = settings.columns || [];

  const addRow = () => {
    const newRow: MatrixRow = {
      id: `row_${Date.now()}`,
      label: `Row ${rows.length + 1}`,
    };
    updateSetting("rows", [...rows, newRow]);
  };

  const updateRow = (id: string, label: string) => {
    updateSetting(
      "rows",
      rows.map((row) => (row.id === id ? { ...row, label } : row))
    );
  };

  const removeRow = (id: string) => {
    updateSetting(
      "rows",
      rows.filter((row) => row.id !== id)
    );
  };

  const addColumn = () => {
    const newColumn: MatrixColumn = {
      id: `col_${Date.now()}`,
      label: `Column ${columns.length + 1}`,
    };
    updateSetting("columns", [...columns, newColumn]);
  };

  const updateColumn = (id: string, label: string) => {
    updateSetting(
      "columns",
      columns.map((col) => (col.id === id ? { ...col, label } : col))
    );
  };

  const removeColumn = (id: string) => {
    updateSetting(
      "columns",
      columns.filter((col) => col.id !== id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rows (questions)</Label>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input
                value={row.label}
                onChange={(e) => updateRow(row.id, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add row
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Columns (answers)</Label>
        <div className="space-y-2">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center gap-2">
              <Input
                value={column.label}
                onChange={(e) => updateColumn(column.id, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeColumn(column.id)}
                disabled={columns.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addColumn}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add column
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="allowMultiplePerRow">
          Allow multiple selections per row
        </Label>
        <Switch
          id="allowMultiplePerRow"
          checked={settings.allowMultiplePerRow || false}
          onCheckedChange={(checked) =>
            updateSetting("allowMultiplePerRow", checked)
          }
        />
      </div>
    </div>
  );
}
