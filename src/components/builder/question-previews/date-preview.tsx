import { Calendar } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface DatePreviewProps {
  question: BuilderQuestion;
}

export function DatePreview({ question }: DatePreviewProps) {
  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm disabled:opacity-60"
        placeholder={question.placeholder || "MM/DD/YYYY"}
        disabled
      />
    </div>
  );
}
