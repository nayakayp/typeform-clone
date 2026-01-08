"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getQuestionTypeLabel, getQuestionTypeIcon } from "@/lib/question-types";

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const {
    questions,
    selectedQuestionId,
    updateQuestion,
    previewCollapsed,
    togglePreview,
  } = useBuilderStore();

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Collapsed state - reuse previewCollapsed for now
  if (previewCollapsed) {
    return (
      <div
        className={cn(
          "flex h-full w-12 flex-col items-center border-l bg-muted/30 py-4",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          className="mb-4"
          title="Expand settings"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-80 flex-col border-l bg-muted/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Settings className="h-4 w-4" />
          Settings
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          title="Collapse settings"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!selectedQuestion ? (
            <EmptyState />
          ) : (
            <QuestionSettings
              question={selectedQuestion}
              onUpdate={(updates) =>
                updateQuestion(selectedQuestion.id, updates)
              }
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Settings className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-sm font-medium">No question selected</h3>
      <p className="text-xs text-muted-foreground">
        Select a question from the canvas to configure its settings
      </p>
    </div>
  );
}

interface QuestionSettingsProps {
  question: {
    id: string;
    type: string;
    title: string | null;
    required: boolean;
  };
  onUpdate: (updates: Partial<{ required: boolean }>) => void;
}

function QuestionSettings({ question, onUpdate }: QuestionSettingsProps) {
  const Icon = getQuestionTypeIcon(question.type);
  const typeLabel = getQuestionTypeLabel(question.type);

  return (
    <div className="space-y-4">
      {/* Question Type Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            {typeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {question.title || "Untitled question"}
          </p>
        </CardContent>
      </Card>

      {/* Required Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="required" className="text-sm font-medium">
                Required
              </Label>
              <p className="text-xs text-muted-foreground">
                Respondents must answer this question
              </p>
            </div>
            <Switch
              id="required"
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for more settings */}
      <Card className="border-dashed">
        <CardContent className="py-6">
          <p className="text-center text-xs text-muted-foreground">
            More settings coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
