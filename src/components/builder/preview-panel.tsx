"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { QUESTION_TYPE_META } from "@/types/builder";
import type { PreviewMode } from "@/types/builder";
import { cn } from "@/lib/utils";
import { Monitor, Tablet, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  className?: string;
}

const previewWidths: Record<PreviewMode, string> = {
  desktop: "w-full",
  tablet: "w-[768px]",
  mobile: "w-[375px]",
};

export function PreviewPanel({ className }: PreviewPanelProps) {
  const {
    questions,
    form,
    previewMode,
    setPreviewMode,
    previewCollapsed,
    togglePreview,
  } = useBuilderStore();

  if (previewCollapsed) {
    return (
      <div
        className={cn(
          "flex h-full w-12 flex-col items-center border-l bg-muted/30 py-4",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreview}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-96 flex-col border-l bg-muted/30",
        className
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Preview</h2>
        <div className="flex items-center gap-1">
          <Button
            variant={previewMode === "desktop" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setPreviewMode("desktop")}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === "tablet" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setPreviewMode("tablet")}
            title="Tablet"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === "mobile" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setPreviewMode("mobile")}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePreview}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div
          className={cn(
            "mx-auto rounded-lg border bg-card shadow-sm",
            previewWidths[previewMode]
          )}
        >
          <div className="p-6">
            <h1 className="mb-2 text-xl font-bold">
              {form?.title || "Untitled Form"}
            </h1>
            {form?.description && (
              <p className="mb-6 text-muted-foreground">{form.description}</p>
            )}

            {questions.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Add questions to see a preview
              </p>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const meta = QUESTION_TYPE_META[question.type];
                  return (
                    <div key={question.id} className="space-y-2">
                      <label className="text-sm font-medium">
                        {index + 1}.{" "}
                        {question.title || "Untitled question"}
                        {question.required && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </label>
                      {question.description && (
                        <p className="text-xs text-muted-foreground">
                          {question.description}
                        </p>
                      )}
                      <PreviewInput type={question.type} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewInput({ type }: { type: string }) {
  switch (type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
      return (
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          Type your answer here...
        </div>
      );
    case "long_text":
      return (
        <div className="min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          Type your answer here...
        </div>
      );
    case "number":
      return (
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          0
        </div>
      );
    case "date":
      return (
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          Select a date...
        </div>
      );
    case "time":
      return (
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          Select a time...
        </div>
      );
    case "multiple_choice":
    case "dropdown":
      return (
        <div className="space-y-2">
          {["Option 1", "Option 2", "Option 3"].map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
            >
              <div className="h-4 w-4 rounded-full border" />
              <span className="text-sm">{opt}</span>
            </div>
          ))}
        </div>
      );
    case "checkboxes":
      return (
        <div className="space-y-2">
          {["Option 1", "Option 2", "Option 3"].map((opt, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
            >
              <div className="h-4 w-4 rounded border" />
              <span className="text-sm">{opt}</span>
            </div>
          ))}
        </div>
      );
    case "yes_no":
      return (
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border bg-background px-4 py-3 text-center text-sm font-medium">
            Yes
          </div>
          <div className="flex-1 rounded-md border bg-background px-4 py-3 text-center text-sm font-medium">
            No
          </div>
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-8 rounded border bg-background text-center leading-8 text-muted-foreground"
            >
              {i}
            </div>
          ))}
        </div>
      );
    case "nps":
    case "opinion_scale":
      return (
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => i).map((i) => (
            <div
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded border bg-background text-xs text-muted-foreground"
            >
              {i}
            </div>
          ))}
        </div>
      );
    case "file_upload":
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-background py-8 text-muted-foreground">
          <span className="text-sm">Click to upload or drag and drop</span>
        </div>
      );
    case "welcome_screen":
    case "thank_you_screen":
    case "statement":
      return null;
    default:
      return (
        <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          [Preview for {type}]
        </div>
      );
  }
}
