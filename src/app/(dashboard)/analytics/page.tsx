"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, FileText, Eye, CheckCircle2 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

interface Form {
  id: string;
  title: string;
  status: string;
  _count?: {
    responses: number;
  };
}

export default function AnalyticsPage() {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const { data: formsData, isLoading: formsLoading } = useQuery({
    queryKey: ["forms-for-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/forms?status=published");
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });

  const forms: Form[] = formsData?.forms ?? [];

  // Auto-select first form if none selected
  if (!selectedFormId && forms.length > 0) {
    setSelectedFormId(forms[0].id);
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track form performance and response trends
          </p>
        </div>

        {forms.length > 0 && (
          <Select
            value={selectedFormId ?? undefined}
            onValueChange={setSelectedFormId}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a form" />
            </SelectTrigger>
            <SelectContent>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {formsLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No published forms</h3>
            <p className="text-muted-foreground text-center mb-4">
              Publish a form to start seeing analytics
            </p>
            <Button asChild>
              <Link href="/forms">Go to Forms</Link>
            </Button>
          </CardContent>
        </Card>
      ) : selectedFormId ? (
        <AnalyticsDashboard formId={selectedFormId} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">Select a form to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
