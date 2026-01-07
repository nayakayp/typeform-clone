"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AtSign } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";
import {
  getAvailableQuestionsForPiping,
  createPipingToken,
  hasPipingTokens,
} from "@/lib/logic/piping";
import {
  getQuestionTypeLabel,
  getQuestionTypeIcon,
} from "@/lib/question-types";

interface PipingTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  questions: BuilderQuestion[];
  currentQuestionId: string;
  showMentionButton?: boolean;
}

export function PipingTextarea({
  value,
  onChange,
  questions,
  currentQuestionId,
  showMentionButton = true,
  className,
  placeholder,
  ...props
}: PipingTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState<number | null>(
    null
  );

  // Get available questions for piping
  const availableQuestions = React.useMemo(() => {
    return getAvailableQuestionsForPiping(questions, currentQuestionId);
  }, [questions, currentQuestionId]);

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle @ key press for mention autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "@" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Store cursor position and open popover
      setCursorPosition(textareaRef.current?.selectionStart ?? null);
      // Let the @ character be typed first
      setTimeout(() => {
        setIsPopoverOpen(true);
      }, 0);
    }

    if (e.key === "Escape" && isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  };

  // Insert a piping token at cursor position
  const insertPipingToken = (questionId: string) => {
    const token = createPipingToken(questionId);
    const textarea = textareaRef.current;

    if (textarea) {
      const start =
        cursorPosition !== null ? cursorPosition : textarea.selectionStart;
      const end =
        cursorPosition !== null ? cursorPosition : textarea.selectionEnd;

      // Check if there's an @ character before cursor that we should replace
      const beforeCursor = value.slice(0, start);
      const afterCursor = value.slice(end);

      // If there's an @ character right before cursor, remove it
      let newValue: string;
      if (beforeCursor.endsWith("@")) {
        newValue = beforeCursor.slice(0, -1) + token + afterCursor;
      } else {
        newValue = beforeCursor + token + afterCursor;
      }

      onChange(newValue);

      // Set cursor position after the inserted token
      const newCursorPos = newValue.indexOf(token) + token.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setIsPopoverOpen(false);
    setCursorPosition(null);
  };

  // Handle button click to open mention picker
  const handleMentionButtonClick = () => {
    setCursorPosition(textareaRef.current?.selectionStart ?? value.length);
    setIsPopoverOpen(true);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type @ to insert a previous answer..."}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          showMentionButton && "pr-10",
          className
        )}
        {...props}
      />

      {/* Mention button */}
      {showMentionButton && availableQuestions.length > 0 && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleMentionButtonClick}
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0"
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="border-b p-2">
              <p className="text-sm font-medium">Insert Answer</p>
              <p className="text-muted-foreground text-xs">
                Click to insert a reference to a previous answer
              </p>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 p-2">
                {availableQuestions.map((question) => {
                  const Icon = getQuestionTypeIcon(question.type);
                  return (
                    <button
                      key={question.id}
                      type="button"
                      className="hover:bg-muted flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors"
                      onClick={() => insertPipingToken(question.id)}
                    >
                      {Icon && (
                        <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            Q{question.order + 1}
                          </span>
                          <span className="truncate text-sm">
                            {question.title ||
                              getQuestionTypeLabel(question.type)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {availableQuestions.length === 0 && (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    No previous questions available
                  </div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}

      {/* Token preview */}
      {hasPipingTokens(value) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {questions
            .filter((q) => value.includes(`{{${q.id}}}`))
            .map((question) => (
              <Badge key={question.id} variant="secondary" className="text-xs">
                Q{question.order + 1}:{" "}
                {question.title || getQuestionTypeLabel(question.type)}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
