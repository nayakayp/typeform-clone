"use client";

import type { BuilderQuestion } from "@/types/builder";

interface LongTextPreviewProps {
  question: BuilderQuestion;
}

export function LongTextPreview({ question }: LongTextPreviewProps) {
  const placeholder = question.placeholder || "Type your answer here...";

  return (
    <div className="w-full">
      <textarea
        placeholder={placeholder}
        rows={4}
        disabled
        className="w-full resize-none rounded-md border border-muted-foreground/20 bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-default disabled:opacity-70"
      />
    </div>
  );
}
