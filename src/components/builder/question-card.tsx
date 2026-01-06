"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/stores/builder-store";
import { QUESTION_TYPE_META } from "@/types/builder";
import type { BuilderQuestion } from "@/types/builder";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: BuilderQuestion;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const {
    selectedQuestionId,
    selectQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
  } = useBuilderStore();

  const isSelected = selectedQuestionId === question.id;
  const meta = QUESTION_TYPE_META[question.type];

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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectQuestion(question.id);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuestion(question.id, { title: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateQuestion(question.id, { description: e.target.value });
  };

  const handleDelete = () => {
    deleteQuestion(question.id);
  };

  const handleDuplicate = () => {
    duplicateQuestion(question.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card transition-all",
        isSelected && "ring-2 ring-primary",
        isDragging && "opacity-50",
        "hover:shadow-sm"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {index + 1}
            </span>
            <Badge variant="secondary" className="text-xs">
              {meta?.label || question.type}
            </Badge>
            {question.required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
          </div>

          <Input
            value={question.title || ""}
            onChange={handleTitleChange}
            placeholder="Enter your question..."
            className="border-0 bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
          />

          {isSelected && (
            <Textarea
              value={question.description || ""}
              onChange={handleDescriptionChange}
              placeholder="Add a description (optional)"
              className="min-h-[60px] resize-none border-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
            />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
