"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  image?: string | null;
  order: number;
}

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  placeholder?: string | null;
  order: number;
  required: boolean;
  validations?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  image?: string | null;
  video?: string | null;
  options?: QuestionOption[];
}

interface FormData {
  id: string;
  title: string;
  description?: string | null;
  settings?: {
    showProgressBar?: boolean;
    showQuestionNumbers?: boolean;
    oneQuestionPerPage?: boolean;
  };
  customTheme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  questions: Question[];
}

interface FormRendererProps {
  form: FormData;
  slug: string;
}

type AnswerValue = string | number | boolean | string[] | null;

export function FormRenderer({ form, slug }: FormRendererProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Filter out welcome/thank you screens for navigation
  const contentQuestions = form.questions.filter(
    (q) => !["welcome_screen", "thank_you_screen", "statement"].includes(q.type)
  );

  const allQuestions = form.questions;
  const oneQuestionPerPage = form.settings?.oneQuestionPerPage ?? true;

  // Find welcome and thank you screens
  const welcomeScreen = allQuestions.find((q) => q.type === "welcome_screen");
  const thankYouScreen = allQuestions.find((q) => q.type === "thank_you_screen");

  const currentQuestion = oneQuestionPerPage
    ? contentQuestions[currentIndex]
    : null;

  const progress = contentQuestions.length > 0
    ? ((currentIndex + 1) / contentQuestions.length) * 100
    : 0;

  // Theme
  const theme = form.customTheme || form.theme || {};
  const primaryColor = theme.primaryColor || "#0066FF";
  const backgroundColor = theme.backgroundColor || "#FFFFFF";
  const textColor = theme.textColor || "#000000";

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;

    const value = answers[currentQuestion.id];
    if (value === null || value === undefined || value === "") {
      toast.error("This question is required");
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      toast.error("Please select at least one option");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    if (currentIndex < contentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers)
        .filter(([_, value]) => value !== null && value !== undefined && value !== "")
        .map(([questionId, value]) => {
          const question = contentQuestions.find((q) => q.id === questionId);
          if (!question) return null;

          const answer: Record<string, unknown> = { questionId };

          if (typeof value === "boolean") {
            answer.booleanValue = value;
          } else if (typeof value === "number") {
            answer.numberValue = value;
          } else if (Array.isArray(value)) {
            answer.jsonValue = value;
          } else if (question.type === "date") {
            answer.dateValue = value;
          } else {
            answer.textValue = String(value);
          }

          return answer;
        })
        .filter(Boolean);

      const response = await fetch(`/api/public/forms/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit");
      }

      setIsComplete(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show thank you screen after completion
  if (isComplete) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="max-w-xl w-full text-center space-y-4">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">
            {thankYouScreen?.title || "Thank you!"}
          </h1>
          {thankYouScreen?.description && (
            <p className="text-lg opacity-80">{thankYouScreen.description}</p>
          )}
        </div>
      </div>
    );
  }

  // Show welcome screen at start
  if (currentIndex === 0 && welcomeScreen && contentQuestions.length > 0) {
    const hasStarted = Object.keys(answers).length > 0;
    if (!hasStarted) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor, color: textColor }}
        >
          <div className="max-w-xl w-full text-center space-y-6">
            <h1 className="text-4xl font-bold">{welcomeScreen.title}</h1>
            {welcomeScreen.description && (
              <p className="text-xl opacity-80">{welcomeScreen.description}</p>
            )}
            <Button
              size="lg"
              onClick={() => setAnswers({ __started: true })}
              style={{ backgroundColor: primaryColor }}
              className="text-white hover:opacity-90"
            >
              Start
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      );
    }
  }

  // Render single question (one per page mode)
  if (oneQuestionPerPage && currentQuestion) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor, color: textColor }}
      >
        {/* Progress bar */}
        {form.settings?.showProgressBar && (
          <div className="h-1 w-full bg-gray-200">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
            />
          </div>
        )}

        {/* Question */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-xl w-full space-y-6">
            <div className="space-y-2">
              {form.settings?.showQuestionNumbers && (
                <span className="text-sm opacity-60">
                  {currentIndex + 1} of {contentQuestions.length}
                </span>
              )}
              <h2 className="text-2xl font-semibold">
                {currentQuestion.title}
                {currentQuestion.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h2>
              {currentQuestion.description && (
                <p className="opacity-70">{currentQuestion.description}</p>
              )}
            </div>

            <QuestionInput
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => setAnswer(currentQuestion.id, value)}
              primaryColor={primaryColor}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentIndex === contentQuestions.length - 1 ? (
                  "Submit"
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render all questions (multi-question mode)
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-lg opacity-80">{form.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {contentQuestions.map((question, index) => (
            <div key={question.id} className="space-y-3 p-4 border rounded-lg">
              <div className="space-y-1">
                {form.settings?.showQuestionNumbers && (
                  <span className="text-sm opacity-60">{index + 1}.</span>
                )}
                <h3 className="text-lg font-medium">
                  {question.title}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
                {question.description && (
                  <p className="text-sm opacity-70">{question.description}</p>
                )}
              </div>
              <QuestionInput
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
                primaryColor={primaryColor}
              />
            </div>
          ))}
        </div>

        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ backgroundColor: primaryColor }}
          className="w-full text-white hover:opacity-90"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Submit
        </Button>
      </div>
    </div>
  );
}

interface QuestionInputProps {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  primaryColor: string;
}

function QuestionInput({ question, value, onChange, primaryColor }: QuestionInputProps) {
  switch (question.type) {
    case "short_text":
      return (
        <Input
          placeholder={question.placeholder || "Type your answer..."}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      );

    case "long_text":
      return (
        <Textarea
          placeholder={question.placeholder || "Type your answer..."}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="text-lg"
        />
      );

    case "email":
      return (
        <Input
          type="email"
          placeholder={question.placeholder || "name@example.com"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          placeholder={question.placeholder || "+1 (555) 000-0000"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      );

    case "url":
      return (
        <Input
          type="url"
          placeholder={question.placeholder || "https://example.com"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          placeholder={question.placeholder || "0"}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="text-lg"
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      );

    case "multiple_choice":
    case "dropdown":
      return (
        <RadioGroup
          value={(value as string) || ""}
          onValueChange={(v) => onChange(v)}
          className="space-y-2"
        >
          {question.options?.map((option) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                value === option.value && "border-2"
              )}
              style={value === option.value ? { borderColor: primaryColor } : {}}
              onClick={() => onChange(option.value)}
            >
              <RadioGroupItem value={option.value} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "checkboxes":
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                selectedValues.includes(option.value) && "border-2"
              )}
              style={
                selectedValues.includes(option.value)
                  ? { borderColor: primaryColor }
                  : {}
              }
              onClick={() => {
                const newValues = selectedValues.includes(option.value)
                  ? selectedValues.filter((v) => v !== option.value)
                  : [...selectedValues, option.value];
                onChange(newValues);
              }}
            >
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newValues = checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v) => v !== option.value);
                  onChange(newValues);
                }}
              />
              <Label className="flex-1 cursor-pointer">{option.label}</Label>
            </div>
          ))}
        </div>
      );

    case "yes_no":
      return (
        <div className="flex gap-4">
          <Button
            type="button"
            variant={value === "yes" ? "default" : "outline"}
            size="lg"
            className="flex-1"
            style={value === "yes" ? { backgroundColor: primaryColor } : {}}
            onClick={() => onChange("yes")}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={value === "no" ? "default" : "outline"}
            size="lg"
            className="flex-1"
            style={value === "no" ? { backgroundColor: primaryColor } : {}}
            onClick={() => onChange("no")}
          >
            No
          </Button>
        </div>
      );

    case "rating":
      const scale = (question.settings?.ratingScale as number) || 5;
      return (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: scale }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              className={cn(
                "w-12 h-12 rounded-lg border text-lg font-medium transition-colors",
                value === num && "text-white"
              )}
              style={value === num ? { backgroundColor: primaryColor } : {}}
              onClick={() => onChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
      );

    case "nps":
    case "opinion_scale":
      return (
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 11 }, (_, i) => i).map((num) => (
            <button
              key={num}
              type="button"
              className={cn(
                "w-10 h-10 rounded border text-sm font-medium transition-colors",
                value === num && "text-white"
              )}
              style={value === num ? { backgroundColor: primaryColor } : {}}
              onClick={() => onChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
      );

    default:
      return (
        <Input
          placeholder="Type your answer..."
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
