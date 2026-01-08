import type { BuilderQuestion } from "@/types/builder";

interface YesNoPreviewProps {
  question: BuilderQuestion;
}

export function YesNoPreview({ question }: YesNoPreviewProps) {
  // Get custom labels from settings or use defaults
  const yesLabel = question.settings?.yesLabel || "Yes";
  const noLabel = question.settings?.noLabel || "No";

  return (
    <div className="flex gap-3">
      <button
        className="flex-1 rounded-lg border-2 border-primary/20 bg-primary/5 px-6 py-4 text-center font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 disabled:opacity-70"
        disabled
      >
        <span className="text-xs text-muted-foreground mr-2">Y</span>
        {yesLabel}
      </button>
      <button
        className="flex-1 rounded-lg border-2 border-primary/20 bg-primary/5 px-6 py-4 text-center font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 disabled:opacity-70"
        disabled
      >
        <span className="text-xs text-muted-foreground mr-2">N</span>
        {noLabel}
      </button>
    </div>
  );
}
