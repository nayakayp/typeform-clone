"use client";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { useBuilderSensors } from "@/lib/dnd";
import { EditableQuestionCard } from "./editable-question-card";
import {
  ShortTextPreview,
  LongTextPreview,
  EmailPreview,
  MultipleChoicePreview,
  CheckboxesPreview,
  UrlPreview,
  NumberPreview,
  PhonePreview,
  TimePreview,
  YesNoPreview,
  DatePreview,
  DropdownPreview,
  StatementPreview,
  OpinionScalePreview,
  RatingPreview,
  NpsPreview,
  SignaturePreview,
  FileUploadPreview,
  RankingPreview,
  PictureChoicePreview,
  AudioRecordingPreview,
  VideoRecordingPreview,
  WelcomeScreenPreview,
  MatrixPreview,
  ThankYouScreenPreview,
  ImageBlockPreview,
  RedirectPreview,
  VideoEmbedPreview,
} from "./question-previews";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface BuilderCanvasProps {
  className?: string;
}

export function BuilderCanvas({ className }: BuilderCanvasProps) {
  const {
    questions,
    reorderQuestions,
    selectQuestion,
    addQuestion,
    selectedQuestionId,
  } = useBuilderStore();
  const sensors = useBuilderSensors();
  const [activeQuestion, setActiveQuestion] = useState<BuilderQuestion | null>(
    null
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const question = questions.find((q) => q.id === active.id);
    if (question) {
      setActiveQuestion(question);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderQuestions(active.id as string, over.id as string);
    }

    setActiveQuestion(null);
  };

  const handleCanvasClick = () => {
    selectQuestion(null);
  };

  const handleAddQuestion = () => {
    addQuestion("short_text");
  };

  return (
    <div
      className={cn("flex-1 overflow-y-auto bg-background p-6", className)}
      onClick={handleCanvasClick}
    >
      <div className="mx-auto max-w-2xl">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {questions.map((question, index) => (
                <EditableQuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  isSelected={selectedQuestionId === question.id}
                  onSelect={() => selectQuestion(question.id)}
                >
                  {question.type === "short_text" && (
                    <ShortTextPreview question={question} />
                  )}
                  {question.type === "long_text" && (
                    <LongTextPreview question={question} />
                  )}
                  {question.type === "email" && (
                    <EmailPreview question={question} />
                  )}
                  {question.type === "multiple_choice" && (
                    <MultipleChoicePreview question={question} />
                  )}
                  {question.type === "checkboxes" && (
                    <CheckboxesPreview question={question} />
                  )}
                  {question.type === "url" && (
                    <UrlPreview question={question} />
                  )}
                  {question.type === "number" && (
                    <NumberPreview question={question} />
                  )}
                  {question.type === "phone" && (
                    <PhonePreview question={question} />
                  )}
                  {question.type === "time" && (
                    <TimePreview question={question} />
                  )}
                  {question.type === "yes_no" && (
                    <YesNoPreview question={question} />
                  )}
                  {question.type === "date" && (
                    <DatePreview question={question} />
                  )}
                  {question.type === "dropdown" && (
                    <DropdownPreview question={question} />
                  )}
                  {question.type === "statement" && (
                    <StatementPreview question={question} />
                  )}
                  {question.type === "rating" && (
                    <RatingPreview question={question} />
                  )}
                  {question.type === "opinion_scale" && (
                    <OpinionScalePreview question={question} />
                  )}
                  {question.type === "nps" && (
                    <NpsPreview question={question} />
                  )}
                  {question.type === "signature" && (
                    <SignaturePreview question={question} />
                  )}
                  {question.type === "file_upload" && (
                    <FileUploadPreview question={question} />
                  )}
                  {question.type === "ranking" && (
                    <RankingPreview question={question} />
                  )}
                  {question.type === "picture_choice" && (
                    <PictureChoicePreview question={question} />
                  )}
                  {question.type === "audio_recording" && (
                    <AudioRecordingPreview question={question} />
                  )}
                  {question.type === "video_recording" && (
                    <VideoRecordingPreview question={question} />
                  )}
                  {question.type === "matrix" && (
                    <MatrixPreview question={question} />
                  )}
                  {question.type === "welcome_screen" && (
                    <WelcomeScreenPreview question={question} />
                  )}
                  {question.type === "thank_you_screen" && (
                    <ThankYouScreenPreview question={question} />
                  )}
                  {question.type === "image_block" && (
                    <ImageBlockPreview question={question} />
                  )}
                  {question.type === "redirect" && (
                    <RedirectPreview question={question} />
                  )}
                  {question.type === "video_embed" && (
                    <VideoEmbedPreview question={question} />
                  )}
                </EditableQuestionCard>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeQuestion && (
              <div className="rounded-lg border bg-card p-4 shadow-lg">
                <span className="font-medium">
                  {activeQuestion.title || "Untitled question"}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              No questions yet. Add your first question!
            </p>
            <Button onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
