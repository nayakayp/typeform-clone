"use client";

import type { BuilderQuestion } from "@/types/builder";

interface ShortTextPreviewProps {
  question: BuilderQuestion;
}

export function ShortTextPreview({ question }: ShortTextPreviewProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={question.placeholder || "Type your answer here..."}
        className="w-full border-b-2 border-muted-foreground/30 bg-transparent py-2 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/50"
        disabled
      />
    </div>
  );
}
