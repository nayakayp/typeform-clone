import { Hash } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface NumberPreviewProps {
  question: BuilderQuestion;
}

export function NumberPreview({ question }: NumberPreviewProps) {
  return (
    <div className="relative">
      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="number"
        className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder={question.placeholder || "0"}
        disabled
      />
    </div>
  );
}
