import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface ThankYouScreenPreviewProps {
  question: BuilderQuestion;
}

export function ThankYouScreenPreview({ question }: ThankYouScreenPreviewProps) {
  const buttonText = question.settings?.buttonText;
  const redirectUrl = question.settings?.redirectUrl;
  const showButton = buttonText && redirectUrl;

  return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="h-12 w-12 mx-auto text-green-500" />

      {/* Note: Title/description handled by EditableQuestionCard */}

      {showButton && (
        <Button variant="outline" disabled className="gap-2">
          {buttonText}
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}

      {!showButton && (
        <p className="text-xs text-muted-foreground">
          Configure redirect in settings
        </p>
      )}
    </div>
  );
}
