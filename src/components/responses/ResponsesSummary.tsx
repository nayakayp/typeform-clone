"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Timer,
  BarChart3,
} from "lucide-react";
import type { ResponseSummary } from "@/lib/responses/types";
import { formatDuration } from "@/lib/responses/utils";
import { format } from "date-fns";

interface ResponsesSummaryProps {
  summary: ResponseSummary;
}

export function ResponsesSummaryComponent({ summary }: ResponsesSummaryProps) {
  const maxDailyCount = Math.max(
    ...summary.responsesOverTime.map((d) => d.count),
    1
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Responses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalResponses}</div>
            <p className="text-muted-foreground text-xs">
              {summary.inProgressResponses} in progress
            </p>
          </CardContent>
        </Card>

        {/* Completed Responses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.completedResponses}
            </div>
            <p className="text-muted-foreground text-xs">
              {summary.partialResponses} partial responses
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completionRate}%</div>
            <Progress value={summary.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Average Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Completion Time
            </CardTitle>
            <Timer className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(summary.averageCompletionTime)}
            </div>
            <p className="text-muted-foreground text-xs">
              Per completed response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Responses Over Time Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-muted-foreground h-4 w-4" />
            <CardTitle className="text-base">Responses Over Time</CardTitle>
          </div>
          <CardDescription>
            Daily response count for the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-end gap-2">
            {summary.responsesOverTime.map((day) => {
              const height =
                maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0;
              const dateObj = new Date(day.date);
              return (
                <div
                  key={day.date}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="relative w-full flex-1">
                    <div
                      className="bg-primary absolute bottom-0 w-full rounded-t-md transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{day.count}</p>
                    <p className="text-muted-foreground text-xs">
                      {format(dateObj, "EEE")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <CardTitle className="text-base">Status Breakdown</CardTitle>
          </div>
          <CardDescription>Distribution of response statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-3 w-3 rounded-full" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {summary.completedResponses}
                </span>
                <span className="text-muted-foreground text-xs">
                  (
                  {summary.totalResponses > 0
                    ? Math.round(
                        (summary.completedResponses / summary.totalResponses) *
                          100
                      )
                    : 0}
                  %)
                </span>
              </div>
            </div>
            <Progress
              value={
                summary.totalResponses > 0
                  ? (summary.completedResponses / summary.totalResponses) * 100
                  : 0
              }
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-secondary h-3 w-3 rounded-full" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {summary.inProgressResponses}
                </span>
                <span className="text-muted-foreground text-xs">
                  (
                  {summary.totalResponses > 0
                    ? Math.round(
                        (summary.inProgressResponses / summary.totalResponses) *
                          100
                      )
                    : 0}
                  %)
                </span>
              </div>
            </div>
            <Progress
              value={
                summary.totalResponses > 0
                  ? (summary.inProgressResponses / summary.totalResponses) * 100
                  : 0
              }
              className="[&>div]:bg-secondary h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-muted-foreground h-3 w-3 rounded-full" />
                <span className="text-sm">Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {summary.partialResponses}
                </span>
                <span className="text-muted-foreground text-xs">
                  (
                  {summary.totalResponses > 0
                    ? Math.round(
                        (summary.partialResponses / summary.totalResponses) *
                          100
                      )
                    : 0}
                  %)
                </span>
              </div>
            </div>
            <Progress
              value={
                summary.totalResponses > 0
                  ? (summary.partialResponses / summary.totalResponses) * 100
                  : 0
              }
              className="[&>div]:bg-muted-foreground h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
