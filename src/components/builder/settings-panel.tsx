"use client";

import { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Sliders,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getQuestionTypeLabel,
  QUESTION_TYPE_ICONS,
} from "@/lib/question-types";
import { ContentTab } from "./config-panel/ContentTab";
import { SettingsTab } from "./config-panel/SettingsTab";
import { LogicTab } from "./config-panel/LogicTab";
import type { BuilderQuestion } from "@/types/builder";

interface SettingsPanelProps {
  className?: string;
}

// Separate component that receives the Icon directly as a prop
function QuestionTypeIconDisplay({ type }: { type: BuilderQuestion["type"] }) {
  const IconComponent = QUESTION_TYPE_ICONS[type];
  if (!IconComponent) return null;
  return <IconComponent className="text-muted-foreground h-4 w-4" />;
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
          "bg-muted/30 flex h-full w-12 flex-col items-center border-l py-4",
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
        <Settings className="text-muted-foreground h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted/30 flex h-full w-80 flex-col overflow-hidden border-l",
        className
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
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
        <QuestionConfigAccordion
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
      <div className="bg-muted mb-4 rounded-full p-4">
        <Settings className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="mb-2 text-sm font-medium">No question selected</h3>
      <p className="text-muted-foreground text-xs">
        Select a question from the canvas to configure its settings
      </p>
    </div>
  );
}

interface QuestionConfigAccordionProps {
  question: BuilderQuestion;
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
}

function QuestionConfigAccordion({
  question,
  onUpdate,
}: QuestionConfigAccordionProps) {
  const [contentOpen, setContentOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logicOpen, setLogicOpen] = useState(false);

  const typeLabel = getQuestionTypeLabel(question.type);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Question Type Header */}
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <QuestionTypeIconDisplay type={question.type} />
        <span className="text-sm font-medium">{typeLabel}</span>
        <span className="text-muted-foreground ml-auto max-w-[120px] truncate text-xs">
          {question.title || "Untitled"}
        </span>
      </div>

      {/* Accordion Sections */}
      <ScrollArea className="flex-1">
        <div className="overflow-x-hidden">
          {/* Content Section */}
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between border-b px-4 py-3 text-sm font-medium transition-colors">
              <span className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-4 w-4" />
                Content
              </span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground h-4 w-4 transition-transform duration-200",
                  contentOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-b p-4">
                <ContentTab question={question} onUpdate={onUpdate} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Settings Section */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between border-b px-4 py-3 text-sm font-medium transition-colors">
              <span className="flex items-center gap-2">
                <Sliders className="text-muted-foreground h-4 w-4" />
                Settings
              </span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground h-4 w-4 transition-transform duration-200",
                  settingsOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-b p-4">
                <SettingsTab question={question} onUpdate={onUpdate} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Logic Section */}
          <Collapsible open={logicOpen} onOpenChange={setLogicOpen}>
            <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between border-b px-4 py-3 text-sm font-medium transition-colors">
              <span className="flex items-center gap-2">
                <GitBranch className="text-muted-foreground h-4 w-4" />
                Logic
              </span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground h-4 w-4 transition-transform duration-200",
                  logicOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4">
                <LogicTab question={question} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
