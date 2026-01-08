"use client";

import { useEffect } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderQuestion } from "@/types/builder";
import type { QuestionOption } from "@/lib/db/schema/questions";

interface RankingPreviewProps {
  question: BuilderQuestion;
}

export function RankingPreview({ question }: RankingPreviewProps) {
  const { updateQuestion } = useBuilderStore();

  // Get options or initialize with defaults
  const options: QuestionOption[] = question.options?.length
    ? question.options
    : [
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Item 1",
          value: "item_1",
          image: null,
          order: 0,
        },
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Item 2",
          value: "item_2",
          image: null,
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Item 3",
          value: "item_3",
          image: null,
          order: 2,
        },
      ];

  // Initialize options if empty
  useEffect(() => {
    if (!question.options?.length) {
      updateQuestion(question.id, { options });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionChange = (optionId: string, newLabel: string) => {
    const updatedOptions = options.map((opt) =>
      opt.id === optionId
        ? { ...opt, label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, "_") }
        : opt
    );
    updateQuestion(question.id, { options: updatedOptions });
  };

  const handleAddOption = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      questionId: question.id,
      label: `Item ${options.length + 1}`,
      value: `item_${options.length + 1}`,
      image: null,
      order: options.length,
    };
    updateQuestion(question.id, { options: [...options, newOption] });
  };

  const handleRemoveOption = (optionId: string) => {
    if (options.length <= 2) return;
    const updatedOptions = options
      .filter((opt) => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, order: index }));
    updateQuestion(question.id, { options: updatedOptions });
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div
          key={option.id}
          className="flex items-center gap-2 group p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <input
            className="flex-1 bg-transparent text-sm focus:outline-none"
            value={option.label}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            placeholder={`Item ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {options.length > 2 && (
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveOption(option.id);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-start gap-2 border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        onClick={handleAddOption}
      >
        <Plus className="h-4 w-4" /> Add item
      </Button>
    </div>
  );
}
