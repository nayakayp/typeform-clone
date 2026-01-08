"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderQuestion } from "@/types/builder";
import type { QuestionOption } from "@/lib/db/schema/questions";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PictureChoicePreviewProps {
  question: BuilderQuestion;
}

interface EditablePictureOptionProps {
  option: QuestionOption;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

function EditablePictureOption({
  option,
  index,
  canDelete,
  onUpdate,
  onDelete,
}: EditablePictureOptionProps) {
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

  // Keyboard shortcut indicator (A, B, C, etc.)
  const shortcut = String.fromCharCode(65 + index);

  return (
    <div className="group/option relative">
      {/* Image area */}
      <div
        className={cn(
          "relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50",
          "flex items-center justify-center cursor-pointer transition-all duration-200",
          "hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        {option.image ? (
          <img
            src={option.image}
            alt={option.label}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
            <ImagePlus className="h-8 w-8" />
            <span className="text-xs">Add image</span>
          </div>
        )}

        {/* Keyboard shortcut badge */}
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded bg-background/90 text-xs font-medium text-muted-foreground shadow-sm">
          {shortcut}
        </span>

        {/* Delete button */}
        {canDelete && (
          <Button
            variant="destructive"
            size="icon"
            className={cn(
              "absolute -right-2 -top-2 h-6 w-6 rounded-full",
              "opacity-0 group-hover/option:opacity-100 transition-opacity"
            )}
            onClick={handleDelete}
            title="Remove option"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Editable label */}
      <div className="mt-2 text-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full border-0 bg-transparent text-center text-sm font-medium outline-none ring-0 placeholder:text-muted-foreground/60"
            placeholder="Enter label..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            onClick={handleClick}
            className="cursor-text text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {value || "Enter label..."}
          </p>
        )}
      </div>
    </div>
  );
}

export function PictureChoicePreview({ question }: PictureChoicePreviewProps) {
  const { updateQuestion } = useBuilderStore();

  // Get options or initialize with defaults
  const options: QuestionOption[] = question.options?.length
    ? question.options
    : [
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Choice 1",
          value: "choice_1",
          image: null,
          order: 0,
        },
        {
          id: crypto.randomUUID(),
          questionId: question.id,
          label: "Choice 2",
          value: "choice_2",
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
      label: `Choice ${options.length + 1}`,
      value: `choice_${options.length + 1}`,
      image: null,
      order: options.length,
    };
    updateQuestion(question.id, { options: [...options, newOption] });
  };

  const canDelete = options.length > 2;

  return (
    <div className="space-y-3">
      {/* Picture grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {options.map((option, index) => (
          <EditablePictureOption
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
        className="w-full justify-center gap-2 border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        onClick={handleAddOption}
      >
        <ImagePlus className="h-4 w-4" />
        Add image choice
      </Button>
    </div>
  );
}
