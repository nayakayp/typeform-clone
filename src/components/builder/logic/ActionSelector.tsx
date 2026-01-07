"use client";

import * as React from "react";
import { ArrowRight, Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SkipLogicAction, SkipLogicActionType } from "@/lib/logic/types";
import type { BuilderQuestion } from "@/types/builder";
import { getQuestionTypeLabel } from "@/lib/question-types";

interface ActionSelectorProps {
  action: SkipLogicAction;
  questions: BuilderQuestion[];
  currentQuestionId: string;
  onChange: (action: SkipLogicAction) => void;
}

export function ActionSelector({
  action,
  questions,
  currentQuestionId,
  onChange,
}: ActionSelectorProps) {
  // Get questions that come after the current question
  const availableTargets = React.useMemo(() => {
    const currentQuestion = questions.find((q) => q.id === currentQuestionId);
    if (!currentQuestion) return [];

    return questions
      .filter((q) => q.order > currentQuestion.order)
      .sort((a, b) => a.order - b.order);
  }, [questions, currentQuestionId]);

  // Handle action type change
  const handleTypeChange = (type: SkipLogicActionType) => {
    if (type === "end_form") {
      onChange({ type: "end_form" });
    } else if (type === "jump_to") {
      onChange({
        type: "jump_to",
        targetQuestionId: availableTargets[0]?.id,
      });
    }
  };

  // Handle target change
  const handleTargetChange = (targetQuestionId: string) => {
    onChange({ ...action, targetQuestionId });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Then</span>
        <Select
          value={action.type}
          onValueChange={(value) =>
            handleTypeChange(value as SkipLogicActionType)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jump_to">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Jump to question</span>
              </div>
            </SelectItem>
            <SelectItem value="end_form">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                <span>End form</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {action.type === "jump_to" && (
        <div className="ml-8">
          <Select
            value={action.targetQuestionId || ""}
            onValueChange={handleTargetChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select target question" />
            </SelectTrigger>
            <SelectContent>
              {availableTargets.map((question) => (
                <SelectItem key={question.id} value={question.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {question.order + 1}.
                    </span>
                    <span className="max-w-[250px] truncate">
                      {question.title || getQuestionTypeLabel(question.type)}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {availableTargets.length === 0 && (
                <div className="text-muted-foreground px-3 py-2 text-sm">
                  No target questions available
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {action.type === "end_form" && (
        <p className="text-muted-foreground ml-8 text-sm">
          The form will end and show the thank you screen
        </p>
      )}
    </div>
  );
}
