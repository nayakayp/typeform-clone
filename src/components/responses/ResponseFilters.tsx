"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import type { ResponseFilters, ResponseStatus } from "@/lib/responses/types";

interface ResponseFiltersProps {
  filters: ResponseFilters;
  onFiltersChange: (filters: ResponseFilters) => void;
}

export function ResponseFiltersComponent({
  filters,
  onFiltersChange,
}: ResponseFiltersProps) {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as ResponseStatus | "all",
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateFrom: date || null,
    });
    setIsDateFromOpen(false);
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateTo: date || null,
    });
    setIsDateToOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      dateFrom: null,
      dateTo: null,
      search: undefined,
    });
  };

  const hasActiveFilters =
    (filters.status && filters.status !== "all") ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search responses..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[160px]">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
        </SelectContent>
      </Select>

      {/* Date From */}
      <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[160px] justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom ? (
              format(filters.dateFrom, "MMM d, yyyy")
            ) : (
              <span className="text-muted-foreground">From date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom || undefined}
            onSelect={handleDateFromChange}
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[160px] justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo ? (
              format(filters.dateTo, "MMM d, yyyy")
            ) : (
              <span className="text-muted-foreground">To date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo || undefined}
            onSelect={handleDateToChange}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
