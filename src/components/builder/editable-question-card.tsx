"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderQuestion } from "@/types/builder";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditableQuestionCardProps {
  question: BuilderQuestion;
  questionNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode; // Question-specific preview
}

export function EditableQuestionCard({
  question,
  questionNumber,
  isSelected,
  onSelect,
  children,
}: EditableQuestionCardProps) {
  const { updateQuestion, deleteQuestion, duplicateQuestion } =
    useBuilderStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas from deselecting
    // Prevent selection when clicking on interactive elements
    if ((e.target as HTMLElement).closest("button, input, textarea")) {
      return;
    }
    onSelect();
  };

  // Title editing handlers
  const handleTitleClick = () => {
    setTitleValue(question.title || "");
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue !== question.title) {
      updateQuestion(question.id, { title: titleValue });
    }
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setTitleValue(question.title || "");
      setIsEditingTitle(false);
    }
  };

  // Description editing handlers
  const handleDescriptionClick = () => {
    setDescriptionValue(question.description || "");
    setIsEditingDescription(true);
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (descriptionValue !== question.description) {
      updateQuestion(question.id, { description: descriptionValue || null });
    }
  };

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setDescriptionValue(question.description || "");
      setIsEditingDescription(false);
    }
  };

  // Action handlers
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteQuestion(question.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateQuestion(question.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card relative rounded-xl border-2 transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "border-border hover:border-muted-foreground/30",
        isDragging && "opacity-50 shadow-lg",
        "hover:shadow-md"
      )}
      onClick={handleCardClick}
    >
      {/* Hover actions - top right */}
      <div
        className={cn(
          "bg-background absolute -top-3 right-3 z-10 flex items-center gap-1 rounded-md border p-1 shadow-sm transition-opacity",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-7 w-7"
          onClick={handleDuplicate}
          title="Duplicate question"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-7 w-7"
          onClick={handleDelete}
          title="Delete question"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-start gap-3 p-4">
        {/* Drag handle - left side */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "text-muted-foreground mt-1 cursor-grab touch-none rounded p-1 transition-all",
            "hover:bg-muted opacity-0 group-hover:opacity-100 active:cursor-grabbing",
            isDragging && "opacity-100"
          )}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Question number + required indicator */}
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {questionNumber}
            </span>
            {question.required && (
              <span className="text-destructive text-sm font-medium">*</span>
            )}
          </div>

          {/* Editable title */}
          <div className="relative">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="placeholder:text-muted-foreground/60 w-full border-0 bg-transparent text-base font-medium ring-0 outline-none focus:ring-0"
                placeholder="Enter your question..."
              />
            ) : (
              <p
                onClick={handleTitleClick}
                className={cn(
                  "cursor-text text-base font-medium transition-colors",
                  question.title
                    ? "text-foreground"
                    : "text-muted-foreground/60 italic"
                )}
              >
                {question.title || "Enter your question..."}
              </p>
            )}
          </div>

          {/* Editable description */}
          <div className="relative">
            {isEditingDescription ? (
              <textarea
                ref={descriptionInputRef}
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleDescriptionKeyDown}
                className="text-muted-foreground placeholder:text-muted-foreground/50 min-h-[40px] w-full resize-none border-0 bg-transparent text-sm ring-0 outline-none focus:ring-0"
                placeholder="Add a description (optional)"
                rows={2}
              />
            ) : (
              <p
                onClick={handleDescriptionClick}
                className={cn(
                  "cursor-text text-sm transition-colors",
                  question.description
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50 italic"
                )}
              >
                {question.description || "Add a description (optional)"}
              </p>
            )}
          </div>

          {/* Children slot for question-specific preview content */}
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
