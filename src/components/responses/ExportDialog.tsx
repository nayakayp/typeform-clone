"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, FileSpreadsheet, FileJson, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ExportFormat = "csv" | "excel" | "json";
type ExportScope = "all" | "selected" | "filtered";

interface ExportDialogProps {
  formId: string;
  selectedIds?: string[];
  filteredCount?: number;
  totalCount: number;
  trigger?: React.ReactNode;
}

const FORMAT_OPTIONS = [
  {
    value: "csv" as const,
    label: "CSV (.csv)",
    description: "Comma-separated values, works with Excel",
    icon: FileText,
  },
  {
    value: "excel" as const,
    label: "Excel (.xls)",
    description: "Native Excel format with multiple sheets",
    icon: FileSpreadsheet,
  },
  {
    value: "json" as const,
    label: "JSON (.json)",
    description: "Structured data format for developers",
    icon: FileJson,
  },
];

const DATE_FORMAT_OPTIONS = [
  { value: "YYYY-MM-DD HH:mm", label: "2024-01-15 14:30" },
  { value: "YYYY-MM-DD HH:mm:ss", label: "2024-01-15 14:30:00" },
  { value: "YYYY-MM-DD", label: "2024-01-15" },
  { value: "DD/MM/YYYY", label: "15/01/2024" },
  { value: "MM/DD/YYYY", label: "01/15/2024" },
];

async function exportResponses(
  formId: string,
  options: {
    format: ExportFormat;
    includeMetadata: boolean;
    dateFormat: string;
    responseIds?: string[];
  }
): Promise<Blob> {
  const response = await fetch(`/api/forms/${formId}/responses/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to export");
  }

  return response.blob();
}

export function ExportDialog({
  formId,
  selectedIds = [],
  filteredCount,
  totalCount,
  trigger,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>("all");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD HH:mm");

  const exportMutation = useMutation({
    mutationFn: () =>
      exportResponses(formId, {
        format,
        includeMetadata,
        dateFormat,
        responseIds: scope === "selected" ? selectedIds : undefined,
      }),
    onSuccess: (blob) => {
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses-${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xls" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Export completed!");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleExport = () => {
    if (scope === "selected" && selectedIds.length === 0) {
      toast.error("Please select some responses first");
      return;
    }
    exportMutation.mutate();
  };

  const getExportCount = () => {
    switch (scope) {
      case "selected":
        return selectedIds.length;
      case "filtered":
        return filteredCount ?? totalCount;
      case "all":
      default:
        return totalCount;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Responses</DialogTitle>
          <DialogDescription>
            Download your form responses in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              {FORMAT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted"
                  onClick={() => setFormat(option.value)}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Scope selection */}
          <div className="space-y-3">
            <Label>What to export</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as ExportScope)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All responses ({totalCount})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="selected"
                  id="selected"
                  disabled={selectedIds.length === 0}
                />
                <Label
                  htmlFor="selected"
                  className={`font-normal cursor-pointer ${
                    selectedIds.length === 0 ? "text-muted-foreground" : ""
                  }`}
                >
                  Selected responses ({selectedIds.length})
                </Label>
              </div>
              {filteredCount !== undefined && filteredCount !== totalCount && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="filtered" />
                  <Label
                    htmlFor="filtered"
                    className="font-normal cursor-pointer"
                  >
                    Filtered responses ({filteredCount})
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Options</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(v) => setIncludeMetadata(!!v)}
              />
              <Label htmlFor="metadata" className="font-normal cursor-pointer">
                Include metadata (IP, device, user agent)
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="dateFormat" className="shrink-0">
                Date format:
              </Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {getExportCount()} response{getExportCount() !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
