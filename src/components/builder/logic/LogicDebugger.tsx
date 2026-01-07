"use client";

import * as React from "react";
import {
  Play,
  RotateCcw,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LogicEngine, createLogicEngine } from "@/lib/logic/engine";
import type { SkipLogic, VisibilityLogic } from "@/lib/logic/types";
import type { BuilderQuestion } from "@/types/builder";
import { getQuestionTypeLabel } from "@/lib/question-types";

interface LogicDebuggerProps {
  questions: BuilderQuestion[];
  skipLogicRules: SkipLogic[];
  visibilityRules: VisibilityLogic[];
}

interface DebugStep {
  questionId: string;
  response: unknown;
  nextQuestionId: string | null;
  skippedQuestions: string[];
  visibilityChanges: { questionId: string; visible: boolean }[];
}

export function LogicDebugger({
  questions,
  skipLogicRules,
  visibilityRules,
}: LogicDebuggerProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentQuestionId, setCurrentQuestionId] = React.useState<
    string | null
  >(null);
  const [responses, setResponses] = React.useState<Record<string, unknown>>({});
  const [currentResponse, setCurrentResponse] = React.useState<string>("");
  const [steps, setSteps] = React.useState<DebugStep[]>([]);
  const [engine, setEngine] = React.useState<LogicEngine | null>(null);

  // Initialize the logic engine
  React.useEffect(() => {
    const newEngine = createLogicEngine({
      questions,
      skipLogicRules,
      visibilityRules,
    });
    setEngine(newEngine);
  }, [questions, skipLogicRules, visibilityRules]);

  // Get the current question
  const currentQuestion = React.useMemo(() => {
    if (!currentQuestionId) return null;
    return questions.find((q) => q.id === currentQuestionId) || null;
  }, [currentQuestionId, questions]);

  // Start the debugger
  const handleStart = () => {
    setIsRunning(true);
    setResponses({});
    setSteps([]);
    setCurrentResponse("");

    // Find the first visible question
    if (engine && questions.length > 0) {
      engine.updateResponses({});
      const firstQuestion = engine.getVisibleQuestions()[0];
      setCurrentQuestionId(firstQuestion?.id || null);
    }
  };

  // Reset the debugger
  const handleReset = () => {
    setIsRunning(false);
    setCurrentQuestionId(null);
    setResponses({});
    setSteps([]);
    setCurrentResponse("");
  };

  // Submit response and move to next question
  const handleNext = () => {
    if (!engine || !currentQuestionId || !currentQuestion) return;

    // Parse the response based on question type
    let parsedResponse: unknown = currentResponse;
    if (currentQuestion.type === "number") {
      parsedResponse = parseFloat(currentResponse) || 0;
    } else if (currentQuestion.type === "yes_no") {
      parsedResponse = currentResponse;
    } else if (currentQuestion.options && currentQuestion.options.length > 0) {
      // For selection types, the response is the option ID
      parsedResponse = currentResponse;
    }

    // Update responses
    const newResponses = { ...responses, [currentQuestionId]: parsedResponse };
    setResponses(newResponses);

    // Update engine and get next question
    engine.updateResponses(newResponses);
    const nextQuestion = engine.getNextQuestion(currentQuestionId);

    // Calculate skipped questions
    const allQuestions = questions.sort((a, b) => a.order - b.order);
    const currentIndex = allQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );
    const nextIndex = nextQuestion
      ? allQuestions.findIndex((q) => q.id === nextQuestion.id)
      : allQuestions.length;

    const skipped = allQuestions
      .slice(currentIndex + 1, nextIndex)
      .filter((q) => !engine.isQuestionVisible(q.id))
      .map((q) => q.id);

    // Get visibility changes
    const visibilityChanges = allQuestions.map((q) => ({
      questionId: q.id,
      visible: engine.isQuestionVisible(q.id),
    }));

    // Record this step
    setSteps([
      ...steps,
      {
        questionId: currentQuestionId,
        response: parsedResponse,
        nextQuestionId: nextQuestion?.id || null,
        skippedQuestions: skipped,
        visibilityChanges,
      },
    ]);

    // Move to next question
    setCurrentQuestionId(nextQuestion?.id || null);
    setCurrentResponse("");

    // If no next question, end the run
    if (!nextQuestion) {
      setIsRunning(false);
    }
  };

  // Render response input based on question type
  const renderResponseInput = () => {
    if (!currentQuestion) return null;

    // For selection types with options
    if (currentQuestion.options && currentQuestion.options.length > 0) {
      return (
        <Select value={currentResponse} onValueChange={setCurrentResponse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {currentQuestion.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For yes/no
    if (currentQuestion.type === "yes_no") {
      return (
        <Select value={currentResponse} onValueChange={setCurrentResponse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // For rating/scale types
    if (["rating", "opinion_scale", "nps"].includes(currentQuestion.type)) {
      return (
        <Input
          type="number"
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          placeholder="Enter a number"
        />
      );
    }

    // Default text input
    return (
      <Input
        type="text"
        value={currentResponse}
        onChange={(e) => setCurrentResponse(e.target.value)}
        placeholder="Enter your answer"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Logic Debugger</h3>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" onClick={handleStart} className="gap-1">
              <Play className="h-3 w-3" />
              Start Test
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Debug interface */}
      {isRunning && currentQuestion && (
        <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
          {/* Current question */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Question {currentQuestion.order + 1}
            </Label>
            <p className="text-sm font-medium">
              {currentQuestion.title ||
                getQuestionTypeLabel(currentQuestion.type)}
            </p>
          </div>

          {/* Response input */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Simulate Response
            </Label>
            {renderResponseInput()}
          </div>

          {/* Next button */}
          <Button onClick={handleNext} className="w-full gap-2">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Completed message */}
      {!isRunning && steps.length > 0 && !currentQuestion && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Form completed!
          </p>
          <p className="text-muted-foreground text-xs">
            {steps.length} questions answered
          </p>
        </div>
      )}

      {/* Step history */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">
            Execution History
          </Label>
          <ScrollArea className="h-[200px] rounded-lg border">
            <div className="space-y-2 p-2">
              {steps.map((step, index) => {
                const question = questions.find(
                  (q) => q.id === step.questionId
                );
                const nextQuestion = step.nextQuestionId
                  ? questions.find((q) => q.id === step.nextQuestionId)
                  : null;

                return (
                  <div
                    key={index}
                    className="bg-background space-y-1 rounded-lg border p-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Q{question?.order ?? 0 + 1}:{" "}
                        {question?.title ||
                          getQuestionTypeLabel(question?.type || "")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {String(step.response)}
                      </Badge>
                    </div>

                    {step.skippedQuestions.length > 0 && (
                      <div className="text-muted-foreground">
                        <span className="text-orange-500">Skipped: </span>
                        {step.skippedQuestions
                          .map((id) => {
                            const q = questions.find((q) => q.id === id);
                            return q ? `Q${q.order + 1}` : id;
                          })
                          .join(", ")}
                      </div>
                    )}

                    <div className="text-muted-foreground flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      {nextQuestion ? (
                        <span>
                          Next: Q{nextQuestion.order + 1} (
                          {nextQuestion.title ||
                            getQuestionTypeLabel(nextQuestion.type)}
                          )
                        </span>
                      ) : (
                        <span className="text-green-500">End of form</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Question visibility overview */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">
          Question Visibility
        </Label>
        <div className="grid grid-cols-2 gap-1">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question) => {
              const isVisible = engine?.isQuestionVisible(question.id) ?? true;
              return (
                <div
                  key={question.id}
                  className={cn(
                    "flex items-center gap-2 rounded p-2 text-xs",
                    isVisible ? "bg-green-500/10" : "bg-muted"
                  )}
                >
                  {isVisible ? (
                    <Eye className="h-3 w-3 text-green-500" />
                  ) : (
                    <EyeOff className="text-muted-foreground h-3 w-3" />
                  )}
                  <span
                    className={cn(
                      "truncate",
                      !isVisible && "text-muted-foreground line-through"
                    )}
                  >
                    Q{question.order + 1}:{" "}
                    {question.title || getQuestionTypeLabel(question.type)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
