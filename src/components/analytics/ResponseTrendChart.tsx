"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendData {
  date: string;
  value: number;
}

interface ResponseTrendChartProps {
  viewsData: TrendData[];
  completionsData: TrendData[];
  title?: string;
}

export function ResponseTrendChart({
  viewsData,
  completionsData,
  title = "Responses Over Time",
}: ResponseTrendChartProps) {
  // Merge data by date
  const mergedData = viewsData.map((v, i) => ({
    date: new Date(v.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    views: v.value,
    completions: completionsData[i]?.value || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={false}
                name="Completions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
