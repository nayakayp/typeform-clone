"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  ResponseWithAnswers,
  ResponseSort,
  ResponseSortField,
  ResponsePagination,
  ResponseStatus,
} from "@/lib/responses/types";
import {
  formatResponseStatus,
  getStatusVariant,
  formatResponseDate,
  formatDuration,
  calculateResponseDuration,
  getRespondentIdentifier,
  getLocationString,
} from "@/lib/responses/utils";

interface ResponsesTableProps {
  responses: ResponseWithAnswers[];
  sort: ResponseSort;
  onSortChange: (sort: ResponseSort) => void;
  pagination: ResponsePagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onView: (response: ResponseWithAnswers) => void;
  onDelete: (id: string) => void;
}

export function ResponsesTable({
  responses,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onView,
  onDelete,
}: ResponsesTableProps) {
  const allSelected = useMemo(() => {
    return (
      responses.length > 0 && responses.every((r) => selectedIds.has(r.id))
    );
  }, [responses, selectedIds]);

  const someSelected = useMemo(() => {
    return responses.some((r) => selectedIds.has(r.id)) && !allSelected;
  }, [responses, selectedIds, allSelected]);

  const handleSort = (field: ResponseSortField) => {
    if (sort.field === field) {
      onSortChange({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ field, direction: "desc" });
    }
  };

  const renderSortIcon = (field: ResponseSortField) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const handleSelectAllChange = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className="rounded-md border">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAllChange}
                  aria-label="Select all"
                  className={someSelected ? "opacity-50" : ""}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Respondent
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <button
                  className="hover:text-foreground flex items-center"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {renderSortIcon("status")}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <button
                  className="hover:text-foreground flex items-center"
                  onClick={() => handleSort("startedAt")}
                >
                  Started
                  {renderSortIcon("startedAt")}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <button
                  className="hover:text-foreground flex items-center"
                  onClick={() => handleSort("completedAt")}
                >
                  Completed
                  {renderSortIcon("completedAt")}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Answers
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {responses.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  No responses found
                </td>
              </tr>
            ) : (
              responses.map((response) => {
                const duration = calculateResponseDuration(
                  response.startedAt,
                  response.completedAt
                );
                return (
                  <tr
                    key={response.id}
                    className="hover:bg-muted/50 border-b transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(response.id)}
                        onCheckedChange={() => onToggleSelection(response.id)}
                        aria-label={`Select response ${response.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {getRespondentIdentifier(
                            response.email,
                            response.respondentId
                          )}
                        </span>
                        {response.email && (
                          <span className="text-muted-foreground text-sm">
                            {response.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={getStatusVariant(
                          response.status as ResponseStatus
                        )}
                      >
                        {formatResponseStatus(
                          response.status as ResponseStatus
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatResponseDate(response.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {response.completedAt
                        ? formatResponseDate(response.completedAt)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDuration(duration)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getLocationString(response.city, response.country)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {response.answers?.length || 0}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(response)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(response.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
            of {pagination.total} results
          </span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
