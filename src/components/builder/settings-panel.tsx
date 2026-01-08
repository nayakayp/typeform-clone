"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getQuestionTypeLabel, getQuestionTypeIcon } from "@/lib/question-types";
import { ContentTab } from "./config-panel/ContentTab";
import { SettingsTab } from "./config-panel/SettingsTab";
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
    previewCollapsed,
    togglePreview,
  } = useBuilderStore();

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Collapsed state
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
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Question Type Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{typeLabel}</span>
        <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">
          {question.title || "Untitled"}
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent px-4">
          <TabsTrigger
            value="content"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="logic"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Logic
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="m-0 p-4">
            <ContentTab question={question} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="settings" className="m-0 p-4">
            <SettingsTab question={question} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="logic" className="m-0 p-4">
            <LogicTab question={question} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
