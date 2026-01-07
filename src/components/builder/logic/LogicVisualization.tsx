"use client";

import * as React from "react";
import { ArrowRight, Eye, GitBranch, Flag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SkipLogic, VisibilityLogic } from "@/lib/logic/types";
import { OPERATOR_META } from "@/lib/logic/types";
import type { BuilderQuestion } from "@/types/builder";
import { getQuestionTypeLabel } from "@/lib/question-types";

interface LogicVisualizationProps {
  questions: BuilderQuestion[];
  skipLogicRules: SkipLogic[];
  visibilityRules: VisibilityLogic[];
  selectedQuestionId?: string | null;
  onQuestionClick?: (questionId: string) => void;
}

interface LogicConnection {
  fromQuestionId: string;
  toQuestionId: string | "end";
  type: "skip" | "visibility";
  conditions: string[];
}

export function LogicVisualization({
  questions,
  skipLogicRules,
  visibilityRules,
  selectedQuestionId,
  onQuestionClick,
}: LogicVisualizationProps) {
  // Build list of logic connections
  const connections = React.useMemo(() => {
    const conns: LogicConnection[] = [];

    // Add skip logic connections
    for (const rule of skipLogicRules) {
      const conditionDescriptions = rule.conditions.map((c) => {
        const question = questions.find((q) => q.id === c.field);
        const questionLabel = question
          ? question.title || `Q${question.order + 1}`
          : c.field;
        const operatorLabel = OPERATOR_META[c.operator]?.label || c.operator;
        const valueLabel = c.value !== undefined ? String(c.value) : "";

        return `${questionLabel} ${operatorLabel} ${valueLabel}`.trim();
      });

      conns.push({
        fromQuestionId: rule.questionId,
        toQuestionId:
          rule.action.type === "end_form"
            ? "end"
            : rule.action.targetQuestionId || "end",
        type: "skip",
        conditions: conditionDescriptions,
      });
    }

    return conns;
  }, [skipLogicRules, questions]);

  // Get visibility info for a question
  const getVisibilityInfo = (questionId: string) => {
    const rule = visibilityRules.find((r) => r.questionId === questionId);
    if (!rule || rule.showIf.length === 0) return null;

    const conditions = rule.showIf.map((c) => {
      const question = questions.find((q) => q.id === c.field);
      const questionLabel = question
        ? question.title || `Q${question.order + 1}`
        : c.field;
      const operatorLabel = OPERATOR_META[c.operator]?.label || c.operator;
      const valueLabel = c.value !== undefined ? String(c.value) : "";

      return `${questionLabel} ${operatorLabel} ${valueLabel}`.trim();
    });

    return {
      operator: rule.operator,
      conditions,
    };
  };

  // Get outgoing connections for a question
  const getOutgoingConnections = (questionId: string) => {
    return connections.filter((c) => c.fromQuestionId === questionId);
  };

  // Check if question has any logic
  const hasLogic = (questionId: string) => {
    return (
      skipLogicRules.some((r) => r.questionId === questionId) ||
      visibilityRules.some((r) => r.questionId === questionId)
    );
  };

  if (questions.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center">
        No questions to visualize
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2 p-4">
        {/* Legend */}
        <div className="text-muted-foreground mb-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-0.5 w-3 bg-blue-500" />
            <span>Skip logic</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>Conditional visibility</span>
          </div>
        </div>

        {/* Questions list with connections */}
        <div className="relative space-y-1">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => {
              const outgoingConns = getOutgoingConnections(question.id);
              const visibilityInfo = getVisibilityInfo(question.id);
              const isSelected = selectedQuestionId === question.id;

              return (
                <div key={question.id} className="relative">
                  {/* Question node */}
                  <div
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30",
                      hasLogic(question.id) && "border-l-4 border-l-blue-500"
                    )}
                    onClick={() => onQuestionClick?.(question.id)}
                  >
                    {/* Question number */}
                    <span className="text-muted-foreground w-6 text-sm font-medium">
                      {question.order + 1}.
                    </span>

                    {/* Question title */}
                    <span className="flex-1 truncate text-sm">
                      {question.title || getQuestionTypeLabel(question.type)}
                    </span>

                    {/* Logic indicators */}
                    <div className="flex items-center gap-2">
                      {/* Skip logic indicator */}
                      {outgoingConns.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="h-6 cursor-help gap-1"
                            >
                              <GitBranch className="h-3 w-3" />
                              <span>Jump</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <div className="space-y-1">
                              {outgoingConns.map((conn, i) => (
                                <div key={i} className="text-xs">
                                  <p className="font-medium">
                                    If:{" "}
                                    {conn.conditions.join(
                                      ` ${skipLogicRules.find((r) => r.questionId === conn.fromQuestionId)?.operator || "and"} `
                                    )}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {conn.toQuestionId === "end" ? (
                                      <span className="flex items-center gap-1">
                                        <Flag className="h-3 w-3" /> End form
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <ArrowRight className="h-3 w-3" /> Jump
                                        to Q
                                        {(questions.find(
                                          (q) => q.id === conn.toQuestionId
                                        )?.order || 0) + 1}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Visibility indicator */}
                      {visibilityInfo && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="h-6 cursor-help gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Show if</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <div className="text-xs">
                              <p className="font-medium">Show if:</p>
                              <p className="text-muted-foreground">
                                {visibilityInfo.conditions.join(
                                  ` ${visibilityInfo.operator} `
                                )}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {/* Connection lines */}
                  {outgoingConns.map((conn, connIndex) => {
                    if (conn.toQuestionId === "end") {
                      return (
                        <div
                          key={connIndex}
                          className="text-muted-foreground absolute top-1/2 right-0 flex items-center gap-1 text-xs"
                          style={{
                            transform: "translateX(100%) translateY(-50%)",
                          }}
                        >
                          <div className="h-0.5 w-8 bg-blue-500" />
                          <Flag className="h-3 w-3 text-blue-500" />
                        </div>
                      );
                    }

                    const targetIndex = questions.findIndex(
                      (q) => q.id === conn.toQuestionId
                    );
                    if (targetIndex === -1) return null;

                    const skipCount = targetIndex - index;
                    if (skipCount <= 0) return null;

                    return (
                      <div
                        key={connIndex}
                        className="absolute left-4 w-0.5 bg-blue-500/50"
                        style={{
                          top: "100%",
                          height: `${skipCount * 48 - 12}px`,
                        }}
                      >
                        <ArrowRight className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 text-blue-500" />
                      </div>
                    );
                  })}
                </div>
              );
            })}

          {/* End node */}
          <div className="border-muted-foreground/30 flex items-center gap-2 rounded-lg border border-dashed p-3">
            <Flag className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">End of form</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
