import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface StatementPreviewProps {
  question: BuilderQuestion;
}

export function StatementPreview({ question }: StatementPreviewProps) {
  const buttonText = question.settings?.buttonText || "Continue";

  return (
    <div className="space-y-4">
      {/* The description/body text is already shown via EditableQuestionCard */}
      {/* Just show the continue button */}
      <Button variant="default" size="lg" disabled className="gap-2">
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
