import type { BuilderQuestion } from "@/types/builder";

interface NpsPreviewProps {
  question: BuilderQuestion;
}

export function NpsPreview({ question }: NpsPreviewProps) {
  const getButtonClass = (num: number) => {
    if (num <= 6) return "border-red-200 bg-red-50 text-red-700";
    if (num <= 8) return "border-yellow-200 bg-yellow-50 text-yellow-700";
    return "border-green-200 bg-green-50 text-green-700";
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-md border-2 text-xs font-medium transition-colors disabled:opacity-70 ${getButtonClass(i)}`}
            disabled
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  );
}
