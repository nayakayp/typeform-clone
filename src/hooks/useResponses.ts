"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  ResponseWithAnswers,
  ResponseFilters,
  ResponseSort,
  ResponsePagination,
  ResponseSummary,
  ResponseStatus,
} from "@/lib/responses/types";
import {
  calculateResponseDuration,
  calculateCompletionRate,
} from "@/lib/responses/utils";

// Mock data generator for development
function generateMockResponses(count: number = 50): ResponseWithAnswers[] {
  const statuses: ResponseStatus[] = ["completed", "in_progress", "partial"];
  const devices = ["Desktop", "Mobile", "Tablet"];
  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  const oses = ["Windows", "macOS", "iOS", "Android", "Linux"];
  const countries = [
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
  ];
  const cities = ["New York", "London", "Berlin", "Paris", "Tokyo"];

  return Array.from({ length: count }, (_, i) => {
    const startedAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const completedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + Math.random() * 30 * 60 * 1000)
        : null;

    return {
      id: `response-${i + 1}`,
      formId: "form-1",
      respondentId:
        Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : null,
      email: Math.random() > 0.5 ? `user${i}@example.com` : null,
      status,
      startedAt,
      completedAt,
      lastActivityAt:
        completedAt ||
        new Date(startedAt.getTime() + Math.random() * 10 * 60 * 1000),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: oses[Math.floor(Math.random() * oses.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      utmSource: Math.random() > 0.7 ? "google" : null,
      utmMedium: Math.random() > 0.7 ? "cpc" : null,
      utmCampaign: Math.random() > 0.7 ? "summer_sale" : null,
      hiddenFields: {},
      createdAt: startedAt,
      form: {
        id: "form-1",
        title: "Customer Feedback Survey",
        slug: "customer-feedback",
      },
      answers: Array.from(
        { length: Math.floor(Math.random() * 10) + 1 },
        (_, j) => ({
          id: `answer-${i}-${j}`,
          responseId: `response-${i + 1}`,
          questionId: `question-${j + 1}`,
          textValue: `Sample answer ${j + 1}`,
          numberValue: null,
          booleanValue: null,
          dateValue: null,
          jsonValue: null,
          fileUrls: [],
          createdAt: new Date(startedAt.getTime() + j * 60000),
          updatedAt: new Date(startedAt.getTime() + j * 60000),
        })
      ),
    };
  });
}

interface UseResponsesOptions {
  formId?: string;
  initialFilters?: ResponseFilters;
  initialSort?: ResponseSort;
  pageSize?: number;
}

interface UseResponsesReturn {
  // Data
  responses: ResponseWithAnswers[];
  filteredResponses: ResponseWithAnswers[];
  paginatedResponses: ResponseWithAnswers[];
  summary: ResponseSummary;
  currentResponse: ResponseWithAnswers | null;

  // State
  isLoading: boolean;
  error: Error | null;
  filters: ResponseFilters;
  sort: ResponseSort;
  pagination: ResponsePagination;
  selectedIds: Set<string>;

  // Actions
  setFilters: (filters: ResponseFilters) => void;
  setSort: (sort: ResponseSort) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  selectResponse: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelection: (id: string) => void;
  setCurrentResponse: (response: ResponseWithAnswers | null) => void;
  deleteResponse: (id: string) => void;
  deleteSelected: () => void;
  refreshResponses: () => void;
  navigateToResponse: (direction: "prev" | "next") => void;
}

export function useResponses(
  options: UseResponsesOptions = {}
): UseResponsesReturn {
  const {
    initialFilters = { status: "all" },
    initialSort = { field: "startedAt", direction: "desc" },
    pageSize: initialPageSize = 10,
  } = options;

  // State
  const [responses, setResponses] = useState<ResponseWithAnswers[]>(() =>
    generateMockResponses(50)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ResponseFilters>(initialFilters);
  const [sort, setSort] = useState<ResponseSort>(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentResponse, setCurrentResponse] =
    useState<ResponseWithAnswers | null>(null);

  // Filter responses
  const filteredResponses = useMemo(() => {
    let result = [...responses];

    // Status filter
    if (filters.status && filters.status !== "all") {
      result = result.filter((r) => r.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter((r) => new Date(r.startedAt) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((r) => new Date(r.startedAt) <= filters.dateTo!);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.email?.toLowerCase().includes(searchLower) ||
          r.respondentId?.toLowerCase().includes(searchLower) ||
          r.answers.some((a) =>
            a.textValue?.toLowerCase().includes(searchLower)
          )
      );
    }

    // Form filter
    if (filters.formId) {
      result = result.filter((r) => r.formId === filters.formId);
    }

    return result;
  }, [responses, filters]);

  // Sort responses
  const sortedResponses = useMemo(() => {
    const sorted = [...filteredResponses].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case "startedAt":
          comparison =
            new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
          break;
        case "completedAt":
          const aCompleted = a.completedAt
            ? new Date(a.completedAt).getTime()
            : 0;
          const bCompleted = b.completedAt
            ? new Date(b.completedAt).getTime()
            : 0;
          comparison = aCompleted - bCompleted;
          break;
        case "lastActivityAt":
          comparison =
            new Date(a.lastActivityAt).getTime() -
            new Date(b.lastActivityAt).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sort.direction === "desc" ? -comparison : comparison;
    });

    return sorted;
  }, [filteredResponses, sort]);

  // Paginate responses
  const paginatedResponses = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sortedResponses.slice(start, end);
  }, [sortedResponses, page, pageSize]);

  // Calculate pagination info
  const pagination = useMemo<ResponsePagination>(() => {
    const total = filteredResponses.length;
    const totalPages = Math.ceil(total / pageSize);
    return {
      page,
      pageSize,
      total,
      totalPages,
    };
  }, [filteredResponses.length, page, pageSize]);

  // Calculate summary
  const summary = useMemo<ResponseSummary>(() => {
    const totalResponses = responses.length;
    const completedResponses = responses.filter(
      (r) => r.status === "completed"
    ).length;
    const inProgressResponses = responses.filter(
      (r) => r.status === "in_progress"
    ).length;
    const partialResponses = responses.filter(
      (r) => r.status === "partial"
    ).length;

    // Calculate average completion time
    const completedWithTime = responses.filter(
      (r) => r.status === "completed" && r.completedAt
    );
    const totalTime = completedWithTime.reduce((acc, r) => {
      const duration = calculateResponseDuration(r.startedAt, r.completedAt);
      return acc + (duration || 0);
    }, 0);
    const averageCompletionTime =
      completedWithTime.length > 0
        ? Math.round(totalTime / completedWithTime.length)
        : 0;

    // Calculate responses over time (last 7 days)
    const responsesOverTime: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = responses.filter((r) => {
        const responseDate = new Date(r.startedAt).toISOString().split("T")[0];
        return responseDate === dateStr;
      }).length;
      responsesOverTime.push({ date: dateStr, count });
    }

    return {
      totalResponses,
      completedResponses,
      inProgressResponses,
      partialResponses,
      completionRate: calculateCompletionRate(
        completedResponses,
        totalResponses
      ),
      averageCompletionTime,
      responsesOverTime,
    };
  }, [responses]);

  // Actions
  const selectResponse = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(paginatedResponses.map((r) => r.id)));
  }, [paginatedResponses]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const deleteResponse = useCallback((id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const deleteSelected = useCallback(() => {
    setResponses((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const refreshResponses = useCallback(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResponses(generateMockResponses(50));
      setIsLoading(false);
    }, 500);
  }, []);

  const navigateToResponse = useCallback(
    (direction: "prev" | "next") => {
      if (!currentResponse) return;

      const currentIndex = sortedResponses.findIndex(
        (r) => r.id === currentResponse.id
      );
      if (currentIndex === -1) return;

      let newIndex: number;
      if (direction === "prev") {
        newIndex =
          currentIndex > 0 ? currentIndex - 1 : sortedResponses.length - 1;
      } else {
        newIndex =
          currentIndex < sortedResponses.length - 1 ? currentIndex + 1 : 0;
      }

      setCurrentResponse(sortedResponses[newIndex]);
    },
    [currentResponse, sortedResponses]
  );

  return {
    // Data
    responses,
    filteredResponses,
    paginatedResponses,
    summary,
    currentResponse,

    // State
    isLoading,
    error,
    filters,
    sort,
    pagination,
    selectedIds,

    // Actions
    setFilters,
    setSort,
    setPage,
    setPageSize,
    selectResponse,
    selectAll,
    deselectAll,
    toggleSelection,
    setCurrentResponse,
    deleteResponse,
    deleteSelected,
    refreshResponses,
    navigateToResponse,
  };
}
