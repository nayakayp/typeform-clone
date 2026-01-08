"use client";

import { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ContentTab } from "./ContentTab";
import { SettingsTab } from "./SettingsTab";
import { LogicTab } from "./LogicTab";
import { getQuestionTypeLabel } from "@/lib/question-types";
import { QUESTION_TYPES } from "@/lib/question-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, FileText, Settings, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderQuestion } from "@/types/builder";

// Separate component to render the icon to avoid ESLint static-components error
function QuestionTypeIcon({ type }: { type: BuilderQuestion["type"] }) {
  const questionTypeConfig = QUESTION_TYPES.find((qt) => qt.id === type);
  if (!questionTypeConfig?.icon) return null;
  const Icon = questionTypeConfig.icon;
  return <Icon className="text-muted-foreground h-5 w-5" />;
}

export function QuestionConfigPanel() {
  const { selectedQuestionId, questions, updateQuestion, selectQuestion } =
    useBuilderStore();

  const [contentOpen, setContentOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logicOpen, setLogicOpen] = useState(false);

  const question = questions.find((q) => q.id === selectedQuestionId);

  if (!question) return null;

  const handleUpdate = (updates: Partial<typeof question>) => {
    updateQuestion(question.id, updates);
  };

  const questionTypeLabel = getQuestionTypeLabel(question.type);

  return (
    <Sheet
      open={!!selectedQuestionId}
      onOpenChange={(open) => {
        if (!open) selectQuestion(null);
      }}
    >
      <SheetContent className="w-[400px] overflow-hidden p-0 sm:w-[450px]">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <QuestionTypeIcon type={question.type} />
            {questionTypeLabel}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="flex flex-col overflow-x-hidden">
            {/* Content Section */}
            <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
              <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between border-b px-6 py-4 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  Content
                </div>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform duration-200",
                    contentOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/20 border-b px-6 py-4">
                  <ContentTab question={question} onUpdate={handleUpdate} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Settings Section */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between border-b px-6 py-4 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="text-muted-foreground h-4 w-4" />
                  Settings
                </div>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform duration-200",
                    settingsOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/20 border-b px-6 py-4">
                  <SettingsTab question={question} onUpdate={handleUpdate} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Logic Section */}
            <Collapsible open={logicOpen} onOpenChange={setLogicOpen}>
              <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between border-b px-6 py-4 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GitBranch className="text-muted-foreground h-4 w-4" />
                  Logic
                </div>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform duration-200",
                    logicOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/20 border-b px-6 py-4">
                  <LogicTab question={question} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
