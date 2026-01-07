"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Eye, Plus, ArrowRight, Flag, Trash2 } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";
import { useBuilderStore } from "@/stores/builder-store";
import { LogicBuilderModal } from "../logic/LogicBuilderModal";
import { OPERATOR_META } from "@/lib/logic/types";
import { getQuestionTypeLabel } from "@/lib/question-types";

interface LogicTabProps {
  question: BuilderQuestion;
}

export function LogicTab({ question }: LogicTabProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const {
    questions,
    skipLogicRules,
    visibilityRules,
    setSkipLogic,
    setVisibilityLogic,
  } = useBuilderStore();

  // Get logic for this question
  const skipLogic = skipLogicRules.find((r) => r.questionId === question.id);
  const visibilityLogic = visibilityRules.find(
    (r) => r.questionId === question.id
  );

  const hasSkipLogic = skipLogic && skipLogic.conditions.length > 0;
  const hasVisibilityLogic =
    visibilityLogic && visibilityLogic.showIf.length > 0;
  const hasAnyLogic = hasSkipLogic || hasVisibilityLogic;

  // Format conditions for display
  const formatConditions = (
    conditions: { field: string; operator: string; value?: unknown }[],
    operator: "and" | "or"
  ) => {
    return conditions
      .map((condition) => {
        const sourceQuestion = questions.find((q) => q.id === condition.field);
        const questionLabel = sourceQuestion
          ? sourceQuestion.title || `Q${sourceQuestion.order + 1}`
          : "Unknown";
        const operatorLabel =
          OPERATOR_META[condition.operator as keyof typeof OPERATOR_META]
            ?.label || condition.operator;
        const valueLabel =
          condition.value !== undefined ? String(condition.value) : "";

        return `${questionLabel} ${operatorLabel} ${valueLabel}`.trim();
      })
      .join(` ${operator.toUpperCase()} `);
  };

  // Handle clear logic
  const handleClearSkipLogic = () => {
    setSkipLogic(question.id, null);
  };

  const handleClearVisibilityLogic = () => {
    setVisibilityLogic(question.id, null);
  };

  return (
    <div className="space-y-6">
      {/* Skip Logic Section */}
      {hasSkipLogic && skipLogic && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <GitBranch className="h-4 w-4 text-blue-500" />
              Jump Logic
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClearSkipLogic}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="bg-muted/50 space-y-2 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">If:</p>
            <p className="text-sm font-medium">
              {formatConditions(skipLogic.conditions, skipLogic.operator)}
            </p>
            <p className="text-muted-foreground text-xs">Then:</p>
            <div className="flex items-center gap-2">
              {skipLogic.action.type === "jump_to" ? (
                <>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Jump to{" "}
                    {(() => {
                      const target = questions.find(
                        (q) => q.id === skipLogic.action.targetQuestionId
                      );
                      return target
                        ? `Q${target.order + 1}: ${target.title || getQuestionTypeLabel(target.type)}`
                        : "Unknown";
                    })()}
                  </span>
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 text-green-500" />
                  <span className="text-sm">End form</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visibility Logic Section */}
      {hasVisibilityLogic && visibilityLogic && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-purple-500" />
              Show/Hide Logic
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClearVisibilityLogic}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="bg-muted/50 space-y-2 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              Show this question if:
            </p>
            <p className="text-sm font-medium">
              {formatConditions(
                visibilityLogic.showIf,
                visibilityLogic.operator
              )}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasAnyLogic && (
        <div className="py-8 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <GitBranch className="text-muted-foreground h-6 w-6" />
          </div>
          <h4 className="mb-2 text-sm font-medium">No logic applied</h4>
          <p className="text-muted-foreground mb-4 text-sm">
            Add logic to show or hide this question based on previous answers,
            or jump to different questions.
          </p>
        </div>
      )}

      {/* Add/Edit logic button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {hasAnyLogic ? "Edit Logic" : "Add Logic"}
      </Button>

      {/* Logic types info */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-muted-foreground text-xs font-medium uppercase">
          Available Logic Types
        </h4>
        <div className="space-y-2">
          <div className="rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium">Jump Logic</p>
              {hasSkipLogic && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Skip to a specific question based on the answer
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-medium">Conditional Display</p>
              {hasVisibilityLogic && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Show or hide this question based on conditions
            </p>
          </div>
        </div>
      </div>

      {/* Logic Builder Modal */}
      <LogicBuilderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        question={question}
        questions={questions}
        skipLogic={skipLogic}
        visibilityLogic={visibilityLogic}
        onSaveSkipLogic={(logic) => setSkipLogic(question.id, logic)}
        onSaveVisibilityLogic={(logic) =>
          setVisibilityLogic(question.id, logic)
        }
      />
    </div>
  );
}
