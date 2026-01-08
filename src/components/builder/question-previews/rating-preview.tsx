import { Star } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface RatingPreviewProps {
  question: BuilderQuestion;
}

export function RatingPreview({ question }: RatingPreviewProps) {
  const maxRating = question.settings?.maxRating || 5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          className="p-1 text-muted-foreground/40 hover:text-yellow-400 transition-colors disabled:hover:text-muted-foreground/40"
          disabled
        >
          <Star className="h-8 w-8" />
        </button>
      ))}
    </div>
  );
}
