"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import {
  BarChart3,
  Eye,
  Flag,
  Loader2,
  MousePointerClick,
  Timer,
} from "lucide-react";

import { MetricCard } from "./MetricCard";
import { ResponseTrendChart } from "./ResponseTrendChart";
import { DropOffFunnel } from "./DropOffFunnel";
import { DeviceBreakdownChart } from "./DeviceBreakdownChart";
import { ChoiceDistributionChart } from "./ChoiceDistributionChart";
import { DateRangePicker } from "./DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsData {
  formId: string;
  dateRange: { from: string; to: string };
  overview: {
    totalViews: number;
    totalStarts: number;
    totalCompletions: number;
    completionRate: number;
    avgCompletionTime: number;
    viewsTrend: { date: string; value: number }[];
    completionsTrend: { date: string; value: number }[];
  };
  devices: { deviceType: string; count: number; percentage: number }[];
  browsers: { browser: string; count: number; percentage: number }[];
  countries: { country: string; count: number; percentage: number }[];
  sources: { source: string; medium: string | null; count: number; percentage: number }[];
  dropOff: {
    questionId: string;
    title: string;
    order: number;
    reached: number;
    answered: number;
    droppedOff: number;
    dropOffRate: number;
    avgTimeSpent: number;
  }[];
}

async function fetchAnalytics(
  formId: string,
  dateRange: DateRange
): Promise<AnalyticsData> {
  const params = new URLSearchParams();
  if (dateRange.from) params.set("from", dateRange.from.toISOString());
  if (dateRange.to) params.set("to", dateRange.to.toISOString());

  const response = await fetch(`/api/forms/${formId}/analytics?${params}`);
  if (!response.ok) throw new Error("Failed to fetch analytics");
  return response.json();
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BR: "Brazil",
  IN: "India",
  JP: "Japan",
  CN: "China",
  KR: "South Korea",
  MX: "Mexico",
  // Add more as needed
};

interface AnalyticsDashboardProps {
  formId: string;
}

export function AnalyticsDashboard({ formId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", formId, dateRange],
    queryFn: () => fetchAnalytics(formId, dateRange!),
    enabled: !!dateRange?.from && !!dateRange?.to,
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Failed to load analytics. Please try again.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with date picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Track your form performance and user engagement
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Overview metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={data.overview.totalViews.toLocaleString()}
          icon={<Eye className="h-4 w-4" />}
        />
        <MetricCard
          title="Started"
          value={data.overview.totalStarts.toLocaleString()}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
        <MetricCard
          title="Completed"
          value={data.overview.totalCompletions.toLocaleString()}
          icon={<Flag className="h-4 w-4" />}
        />
        <MetricCard
          title="Completion Rate"
          value={`${data.overview.completionRate.toFixed(1)}%`}
          description="Of users who started"
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Average completion time */}
      {data.overview.avgCompletionTime > 0 && (
        <MetricCard
          title="Average Completion Time"
          value={formatDuration(data.overview.avgCompletionTime)}
          icon={<Timer className="h-4 w-4" />}
          className="md:w-1/4"
        />
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Response trend chart */}
          <ResponseTrendChart
            viewsData={data.overview.viewsTrend}
            completionsData={data.overview.completionsTrend}
          />

          {/* Drop-off funnel */}
          <DropOffFunnel steps={data.dropOff} />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {/* Question performance table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {data.dropOff.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="text-right">Reached</TableHead>
                      <TableHead className="text-right">Answered</TableHead>
                      <TableHead className="text-right">Drop-off Rate</TableHead>
                      <TableHead className="text-right">Avg. Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.dropOff.map((question) => (
                      <TableRow key={question.questionId}>
                        <TableCell>{question.order + 1}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {question.title}
                        </TableCell>
                        <TableCell className="text-right">
                          {question.reached}
                        </TableCell>
                        <TableCell className="text-right">
                          {question.answered}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              question.dropOffRate > 20
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            {question.dropOffRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDuration(question.avgTimeSpent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Device breakdown */}
            <DeviceBreakdownChart data={data.devices} />

            {/* Browser breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Browser Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {data.browsers.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.browsers.slice(0, 5).map((browser) => (
                      <div
                        key={browser.browser}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{browser.browser}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${browser.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {browser.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Country breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                {data.countries.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.countries.slice(0, 5).map((country) => (
                      <div
                        key={country.country}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {COUNTRY_NAMES[country.country] || country.country}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {country.count}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({country.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {data.sources.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.sources.slice(0, 5).map((source, i) => (
                      <div
                        key={`${source.source}-${source.medium}-${i}`}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {source.source}
                          </span>
                          {source.medium && (
                            <span className="text-sm text-muted-foreground">
                              {" "}
                              / {source.medium}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {source.count}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({source.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
