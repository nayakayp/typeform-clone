import { Mic, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface AudioRecordingPreviewProps {
  question: BuilderQuestion;
}

export function AudioRecordingPreview({ question }: AudioRecordingPreviewProps) {
  const maxDuration = question.settings?.maxDuration || "2:00";

  return (
    <div className="text-center space-y-4 py-4">
      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Mic className="h-10 w-10 text-primary" />
      </div>
      <Button size="lg" disabled className="gap-2">
        <Circle className="h-4 w-4 fill-red-500 text-red-500" />
        Start Recording
      </Button>
      <p className="text-xs text-muted-foreground">
        Max duration: {maxDuration}
      </p>
    </div>
  );
}
