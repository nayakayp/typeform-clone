"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderQuestion } from "@/types/builder";
import type { QuestionOption } from "@/lib/db/schema/questions";
import { cn } from "@/lib/utils";
import { Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropdownPreviewProps {
  question: BuilderQuestion;
}

interface EditableOptionProps {
  option: QuestionOption;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

function EditableOption({
  option,
  index,
  canDelete,
  onUpdate,
  onDelete,
}: EditableOptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(option.label);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setValue(option.label);
  }, [option.label]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (value.trim() && value !== option.label) {
      onUpdate(option.id, value.trim());
    } else if (!value.trim()) {
      setValue(option.label); // Reset to original if empty
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setValue(option.label);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(option.id);
  };

  return (
    <div
      className={cn(
        "group/option relative flex items-center gap-3 rounded-md border-l-2 border-muted-foreground/30 py-1.5 pl-3 pr-2 transition-all duration-200",
        "hover:border-primary/60 hover:bg-primary/5",
        isEditing && "border-primary bg-primary/5"
      )}
    >
      {/* Option number */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-medium text-muted-foreground">
        {index + 1}.
      </span>

      {/* Editable label */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full border-0 bg-transparent text-sm font-medium outline-none ring-0 placeholder:text-muted-foreground/60"
            placeholder="Enter option label..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            onClick={handleClick}
            className="cursor-text text-sm font-medium text-foreground transition-colors"
          >
            {value || "Enter option label..."}
          </p>
        )}
      </div>

      {/* Delete button - only visible on hover and if can delete */}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 shrink-0 text-muted-foreground transition-opacity",
            "opacity-0 group-hover/option:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          )}
          onClick={handleDelete}
          title="Remove option"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function DropdownPreview({ question }: DropdownPreviewProps) {
  const { updateQuestion } = useBuilderStore();

  // Get options or initialize with defaults
  const options: QuestionOption[] = question.options?.length
    ? question.options
    : [
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Option 1",
          value: "option_1",
          image: null,
          order: 0,
        },
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Option 2",
          value: "option_2",
          image: null,
          order: 1,
        },
      ];

  // Initialize options if empty
  useEffect(() => {
    if (!question.options?.length) {
      updateQuestion(question.id, { options });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateOption = (optionId: string, label: string) => {
    const newOptions = options.map((opt) =>
      opt.id === optionId
        ? { ...opt, label, value: label.toLowerCase().replace(/\s+/g, "_") }
        : opt
    );
    updateQuestion(question.id, { options: newOptions });
  };

  const handleDeleteOption = (optionId: string) => {
    if (options.length <= 2) return; // Minimum 2 options required
    const newOptions = options
      .filter((opt) => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, order: index }));
    updateQuestion(question.id, { options: newOptions });
  };

  const handleAddOption = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      questionId: question.id,
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
      image: null,
      order: options.length,
    };
    updateQuestion(question.id, { options: [...options, newOption] });
  };

  const canDelete = options.length > 2;

  return (
    <div className="space-y-3">
      {/* Dropdown preview (closed state) */}
      <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-sm">
        <span className="text-muted-foreground">
          {question.placeholder || "Select an option..."}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Editable options list */}
      <div className="space-y-1.5 rounded-md border border-dashed border-muted-foreground/30 p-2">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Dropdown options:
        </p>
        <div className="space-y-1">
          {options.map((option, index) => (
            <EditableOption
              key={option.id}
              option={option}
              index={index}
              canDelete={canDelete}
              onUpdate={handleUpdateOption}
              onDelete={handleDeleteOption}
            />
          ))}
        </div>

        {/* Add option button */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2 border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          onClick={handleAddOption}
        >
          <Plus className="h-4 w-4" />
          Add option
        </Button>
      </div>
    </div>
  );
}
