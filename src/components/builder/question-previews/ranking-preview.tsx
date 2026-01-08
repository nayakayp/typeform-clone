import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderQuestion } from "@/types/builder";

interface RankingPreviewProps {
  question: BuilderQuestion;
}

export function RankingPreview({ question }: RankingPreviewProps) {
  const { updateQuestion } = useBuilderStore();
  const options = question.options || [];

  const handleOptionChange = (optionId: string, newLabel: string) => {
    const updatedOptions = options.map((opt) =>
      opt.id === optionId ? { ...opt, label: newLabel } : opt
    );
    updateQuestion(question.id, { options: updatedOptions });
  };

  const handleAddOption = () => {
    const newOption = {
      id: crypto.randomUUID(),
      label: "",
    };
    updateQuestion(question.id, { options: [...options, newOption] });
  };

  const handleRemoveOption = (optionId: string) => {
    if (options.length <= 2) return;
    const updatedOptions = options.filter((opt) => opt.id !== optionId);
    updateQuestion(question.id, { options: updatedOptions });
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div
          key={option.id}
          className="flex items-center gap-2 group p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <input
            className="flex-1 bg-transparent text-sm focus:outline-none"
            value={option.label}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            placeholder={`Item ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {options.length > 2 && (
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveOption(option.id);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleAddOption();
        }}
      >
        <Plus className="h-4 w-4 mr-1" /> Add item
      </Button>
    </div>
  );
}
