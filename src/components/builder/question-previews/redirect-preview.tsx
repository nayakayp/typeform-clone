import { ExternalLink } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface RedirectPreviewProps {
  question: BuilderQuestion;
}

export function RedirectPreview({ question }: RedirectPreviewProps) {
  const redirectUrl = question.settings?.redirectUrl || "";

  return (
    <div className="text-center space-y-4 py-4">
      <ExternalLink className="h-12 w-12 mx-auto text-primary" />
      <div className="space-y-2">
        <p className="text-sm font-medium">Redirecting to:</p>
        <input
          className="w-full max-w-md mx-auto rounded-md border border-input bg-background px-3 py-2 text-sm text-center"
          placeholder="https://example.com"
          defaultValue={redirectUrl}
        />
      </div>
    </div>
  );
}
