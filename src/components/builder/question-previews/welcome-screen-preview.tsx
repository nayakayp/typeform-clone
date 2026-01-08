import { ImagePlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface WelcomeScreenPreviewProps {
  question: BuilderQuestion;
}

export function WelcomeScreenPreview({ question }: WelcomeScreenPreviewProps) {
  const buttonText = question.settings?.buttonText || "Start";
  const image = question.image;

  return (
    <div className="text-center space-y-4 py-4">
      {/* Image area */}
      {image ? (
        <img
          src={image}
          alt=""
          className="max-h-32 mx-auto rounded-lg object-cover"
        />
      ) : (
        <div className="w-32 h-24 mx-auto rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
          <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}

      {/* Note: Title/description handled by EditableQuestionCard */}

      {/* Start button */}
      <Button size="lg" disabled className="gap-2">
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
