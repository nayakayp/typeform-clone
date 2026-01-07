"use client";

import { useBuilderStore } from "@/stores/builder-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentTab } from "./ContentTab";
import { SettingsTab } from "./SettingsTab";
import { LogicTab } from "./LogicTab";
import { getQuestionTypeLabel, getQuestionTypeIcon } from "@/lib/question-types";
import { ScrollArea } from "@/components/ui/scroll-area";

export function QuestionConfigPanel() {
  const { selectedQuestionId, questions, updateQuestion, selectQuestion } =
    useBuilderStore();

  const question = questions.find((q) => q.id === selectedQuestionId);

  if (!question) return null;

  const handleUpdate = (updates: Partial<typeof question>) => {
    updateQuestion(question.id, updates);
  };

  const Icon = getQuestionTypeIcon(question.type);

  return (
    <Sheet
      open={!!selectedQuestionId}
      onOpenChange={(open) => {
        if (!open) selectQuestion(null);
      }}
    >
      <SheetContent className="w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            {getQuestionTypeLabel(question.type)}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="content" className="flex flex-col h-[calc(100vh-73px)]">
          <TabsList className="grid w-full grid-cols-3 px-6 py-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="content" className="p-6 mt-0">
              <ContentTab question={question} onUpdate={handleUpdate} />
            </TabsContent>

            <TabsContent value="settings" className="p-6 mt-0">
              <SettingsTab question={question} onUpdate={handleUpdate} />
            </TabsContent>

            <TabsContent value="logic" className="p-6 mt-0">
              <LogicTab question={question} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
