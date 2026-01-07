"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Lightbulb, Target } from "lucide-react";
import { toast } from "sonner";

interface ResponseAnalysis {
  summary: string;
  keyThemes: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  insights: string[];
  recommendations: string[];
}

interface AIInsightsPanelProps {
  formId: string;
  responseCount: number;
}

export function AIInsightsPanel({ formId, responseCount }: AIInsightsPanelProps) {
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/forms/${formId}/ai/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to analyze");
      }
      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const analysis: ResponseAnalysis | null = analyzeMutation.data?.analysis || null;

  if (!analysis && !analyzeMutation.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis of your form responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responseCount < 5 ? (
            <p className="text-sm text-muted-foreground">
              You need at least 5 responses for AI analysis.
              Currently have {responseCount} response{responseCount !== 1 ? "s" : ""}.
            </p>
          ) : (
            <Button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Responses
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (analyzeMutation.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Sentiment Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Positive
              </span>
              <span>{analysis.sentimentBreakdown.positive}%</span>
            </div>
            <Progress value={analysis.sentimentBreakdown.positive} className="h-2 bg-green-100" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Minus className="h-4 w-4" />
                Neutral
              </span>
              <span>{analysis.sentimentBreakdown.neutral}%</span>
            </div>
            <Progress value={analysis.sentimentBreakdown.neutral} className="h-2 bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-4 w-4" />
                Negative
              </span>
              <span>{analysis.sentimentBreakdown.negative}%</span>
            </div>
            <Progress value={analysis.sentimentBreakdown.negative} className="h-2 bg-red-100" />
          </div>
        </CardContent>
      </Card>

      {/* Key Themes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.keyThemes.map((theme, i) => (
              <Badge key={i} variant="secondary">
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary font-medium">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
