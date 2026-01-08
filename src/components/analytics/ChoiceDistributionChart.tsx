"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OptionData {
  optionValue: string;
  count: number;
  percentage: number;
}

interface ChoiceDistributionChartProps {
  data: OptionData[];
  title?: string;
}

const COLORS = ["#0066FF", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function ChoiceDistributionChart({
  data,
  title = "Answer Distribution",
}: ChoiceDistributionChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: d.optionValue.length > 20 ? d.optionValue.slice(0, 20) + "..." : d.optionValue,
    fullName: d.optionValue,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} (${(props.payload as { percentage?: number })?.percentage?.toFixed(1)}%)`,
                  (props.payload as { fullName?: string })?.fullName || name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
