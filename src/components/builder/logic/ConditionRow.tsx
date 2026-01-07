"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LogicCondition, LogicOperator } from "@/lib/logic/types";
import { OPERATOR_META, getApplicableOperators } from "@/lib/logic/types";
import { operatorRequiresValue } from "@/lib/logic/operators";
import type { BuilderQuestion } from "@/types/builder";
import { getQuestionTypeLabel } from "@/lib/question-types";

interface ConditionRowProps {
  condition: LogicCondition;
  index: number;
  questions: BuilderQuestion[];
  currentQuestionId: string;
  onChange: (index: number, condition: LogicCondition) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export function ConditionRow({
  condition,
  index,
  questions,
  currentQuestionId,
  onChange,
  onRemove,
  showRemove,
}: ConditionRowProps) {
  // Get questions that come before the current question
  const availableQuestions = React.useMemo(() => {
    const currentQuestion = questions.find((q) => q.id === currentQuestionId);
    if (!currentQuestion) return [];

    return questions
      .filter((q) => q.order < currentQuestion.order)
      .filter(
        (q) =>
          ![
            "welcome_screen",
            "statement",
            "thank_you_screen",
            "redirect",
            "video_embed",
            "image_block",
          ].includes(q.type)
      )
      .sort((a, b) => a.order - b.order);
  }, [questions, currentQuestionId]);

  // Get the selected question
  const selectedQuestion = questions.find((q) => q.id === condition.field);

  // Get applicable operators for the selected question type
  const applicableOperators = React.useMemo(() => {
    if (!selectedQuestion) return [];
    return getApplicableOperators(selectedQuestion.type);
  }, [selectedQuestion]);

  // Handle field change
  const handleFieldChange = (fieldId: string) => {
    const newCondition: LogicCondition = {
      ...condition,
      field: fieldId,
      operator: "equals", // Reset to default operator
      value: undefined,
    };
    onChange(index, newCondition);
  };

  // Handle operator change
  const handleOperatorChange = (operator: LogicOperator) => {
    const newCondition: LogicCondition = {
      ...condition,
      operator,
      value: operatorRequiresValue(operator) ? condition.value : undefined,
    };
    onChange(index, newCondition);
  };

  // Handle value change
  const handleValueChange = (value: string) => {
    onChange(index, { ...condition, value });
  };

  // Render value input based on question type and operator
  const renderValueInput = () => {
    if (!operatorRequiresValue(condition.operator)) {
      return null;
    }

    // For selection-type questions, show dropdown with options
    if (
      selectedQuestion?.options &&
      selectedQuestion.options.length > 0 &&
      ["equals", "not_equals"].includes(condition.operator)
    ) {
      return (
        <Select
          value={String(condition.value || "")}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {selectedQuestion.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For yes/no questions
    if (
      selectedQuestion?.type === "yes_no" &&
      ["equals", "not_equals"].includes(condition.operator)
    ) {
      return (
        <Select
          value={String(condition.value || "")}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // For number-type operators
    if (
      [
        "greater_than",
        "less_than",
        "greater_or_equal",
        "less_or_equal",
      ].includes(condition.operator)
    ) {
      return (
        <Input
          type="number"
          value={String(condition.value || "")}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Enter value"
        />
      );
    }

    // Default text input
    return (
      <Input
        type="text"
        value={String(condition.value || "")}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Enter value"
      />
    );
  };

  return (
    <div className="flex items-start gap-2">
      {/* Field selector */}
      <div className="flex-1">
        <Select value={condition.field || ""} onValueChange={handleFieldChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select question" />
          </SelectTrigger>
          <SelectContent>
            {availableQuestions.map((question) => (
              <SelectItem key={question.id} value={question.id}>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {question.order + 1}.
                  </span>
                  <span className="max-w-[200px] truncate">
                    {question.title || getQuestionTypeLabel(question.type)}
                  </span>
                </div>
              </SelectItem>
            ))}
            {availableQuestions.length === 0 && (
              <div className="text-muted-foreground px-3 py-2 text-sm">
                No previous questions available
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Operator selector */}
      <div className="w-[180px]">
        <Select
          value={condition.operator || "equals"}
          onValueChange={(value) =>
            handleOperatorChange(value as LogicOperator)
          }
          disabled={!condition.field}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {applicableOperators.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {OPERATOR_META[operator].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Value input */}
      {condition.field && operatorRequiresValue(condition.operator) && (
        <div className="flex-1">{renderValueInput()}</div>
      )}

      {/* Remove button */}
      {showRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
