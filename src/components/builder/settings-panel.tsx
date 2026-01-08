"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getQuestionTypeLabel, getQuestionTypeIcon } from "@/lib/question-types";
import { GeneralTab } from "./config-panel/GeneralTab";
import { LogicTab } from "./config-panel/LogicTab";
import type { BuilderQuestion } from "@/types/builder";

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const {
    questions,
    selectedQuestionId,
    updateQuestion,
  } = useBuilderStore();

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  return (
    <div
      className={cn(
        "flex h-full w-80 flex-col border-l bg-muted/30",
        className
      )}
    >
      {/* Content */}
      {!selectedQuestion ? (
        <EmptyState />
      ) : (
        <QuestionConfigTabs
          question={selectedQuestion}
          onUpdate={(updates) => updateQuestion(selectedQuestion.id, updates)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
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

interface QuestionConfigTabsProps {
  question: BuilderQuestion;
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
}

function QuestionConfigTabs({ question, onUpdate }: QuestionConfigTabsProps) {
  const Icon = getQuestionTypeIcon(question.type);
  const typeLabel = getQuestionTypeLabel(question.type);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Question Type Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{typeLabel}</span>
        <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">
          {question.title || "Untitled"}
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="grid w-full shrink-0 grid-cols-2 rounded-none border-b bg-transparent px-4">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="logic"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Logic
          </TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="general" className="m-0 p-4">
            <GeneralTab question={question} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="logic" className="m-0 p-4">
            <LogicTab question={question} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
