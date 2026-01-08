import { PenLine } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface SignaturePreviewProps {
  question: BuilderQuestion;
}

export function SignaturePreview({ question }: SignaturePreviewProps) {
  return (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/20">
      <div className="h-24 flex flex-col items-center justify-center">
        <PenLine className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground/60 italic">Sign here</p>
      </div>
      <div className="border-t border-muted-foreground/30 mt-4 pt-2">
        <p className="text-xs text-muted-foreground/50">Signature</p>
      </div>
    </div>
  );
}
