"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SuggestedQuestion {
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: Array<{ value: string }>;
  reason: string;
}

interface QuestionSuggestionsProps {
  formId: string;
  formTitle: string;
  formDescription?: string;
  existingQuestions: Array<{ title: string; type: string }>;
  onAddQuestion: (question: SuggestedQuestion) => void;
}

export function QuestionSuggestions({
  formTitle,
  formDescription,
  existingQuestions,
  onAddQuestion,
}: QuestionSuggestionsProps) {
  const suggestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/suggest-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formTitle,
          formDescription,
          existingQuestions,
        }),
      });
      if (!res.ok) throw new Error("Failed to get suggestions");
      return res.json();
    },
    onError: () => {
      toast.error("Failed to get question suggestions");
    },
  });

  const suggestions: SuggestedQuestion[] = suggestMutation.data?.suggestions || [];

  const getQuestionTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      short_text: "Short Text",
      long_text: "Long Text",
      email: "Email",
      phone: "Phone",
      number: "Number",
      single_choice: "Single Choice",
      multiple_choice: "Multiple Choice",
      dropdown: "Dropdown",
      rating: "Rating",
      yes_no: "Yes/No",
      date: "Date",
      url: "URL",
    };
    return typeMap[type] || type;
  };

  if (!suggestMutation.data && !suggestMutation.isPending) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Question Suggestions
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions for additional questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => suggestMutation.mutate()}
            disabled={suggestMutation.isPending}
          >
            {suggestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting suggestions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (suggestMutation.isPending) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Question Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggestions
            </CardTitle>
            <CardDescription>
              Click to add any suggested question
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => suggestMutation.mutate()}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <div
            key={i}
            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => onAddQuestion(suggestion)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{suggestion.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {getQuestionTypeBadge(suggestion.type)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {suggestion.reason}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
