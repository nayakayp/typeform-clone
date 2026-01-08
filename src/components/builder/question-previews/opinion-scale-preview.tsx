import type { BuilderQuestion } from "@/types/builder";

interface OpinionScalePreviewProps {
  question: BuilderQuestion;
}

export function OpinionScalePreview({ question }: OpinionScalePreviewProps) {
  const startAt = question.settings?.scaleMin ?? 1;
  const endAt = question.settings?.scaleMax ?? 5;
  const startLabel = question.settings?.leftLabel ?? "";
  const endLabel = question.settings?.rightLabel ?? "";

  const numbers = Array.from(
    { length: endAt - startAt + 1 },
    (_, i) => startAt + i
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            className="w-10 h-10 rounded-lg border-2 border-primary/20 bg-primary/5 font-medium text-sm transition-colors hover:border-primary/40 disabled:opacity-70"
            disabled
          >
            {num}
          </button>
        ))}
      </div>
      {(startLabel || endLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
}
