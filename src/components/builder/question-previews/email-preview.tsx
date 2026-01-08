"use client";

import { Mail } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface EmailPreviewProps {
  question: BuilderQuestion;
}

export function EmailPreview({ question }: EmailPreviewProps) {
  const placeholder = question.placeholder || "name@example.com";

  return (
    <div className="relative w-full">
      <Mail className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
      <input
        type="email"
        placeholder={placeholder}
        disabled
        className="w-full border-b-2 border-muted-foreground/20 bg-transparent py-2 pl-6 pr-0 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-default disabled:opacity-70"
      />
    </div>
  );
}
