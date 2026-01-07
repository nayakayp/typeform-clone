"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Download,
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { ExportDialog } from "./ExportDialog";

type BulkAction = "delete" | "archive" | "export";

interface BulkActionsBarProps {
  formId: string;
  selectedIds: string[];
  totalCount: number;
  onClearSelection: () => void;
}

async function performBulkAction(
  formId: string,
  action: "delete" | "archive",
  ids: string[]
): Promise<{ affectedCount: number }> {
  const response = await fetch(`/api/forms/${formId}/responses/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to perform action");
  }

  return response.json();
}

export function BulkActionsBar({
  formId,
  selectedIds,
  totalCount,
  onClearSelection,
}: BulkActionsBarProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const bulkMutation = useMutation({
    mutationFn: ({ action }: { action: "delete" | "archive" }) =>
      performBulkAction(formId, action, selectedIds),
    onSuccess: (result, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["responses", formId] });
      toast.success(
        `${result.affectedCount} response${result.affectedCount !== 1 ? "s" : ""} ${action === "delete" ? "deleted" : "archived"}`
      );
      onClearSelection();
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (action: BulkAction) => {
    switch (action) {
      case "delete":
        setDeleteDialogOpen(true);
        break;
      case "archive":
        bulkMutation.mutate({ action: "archive" });
        break;
      // Export is handled by ExportDialog
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-2 shadow-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>

          <div className="flex items-center gap-1">
            <ExportDialog
              formId={formId}
              selectedIds={selectedIds}
              totalCount={totalCount}
              trigger={
                <Button variant="ghost" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              }
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("archive")}
              disabled={bulkMutation.isPending}
            >
              <Archive className="mr-1 h-4 w-4" />
              Archive
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleAction("delete")}
              disabled={bulkMutation.isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAction("export")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("archive")}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleAction("delete")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete responses?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length} response
              {selectedIds.length !== 1 ? "s" : ""}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bulkMutation.mutate({ action: "delete" })}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
