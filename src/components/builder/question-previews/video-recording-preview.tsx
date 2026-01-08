import { Video, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";

interface VideoRecordingPreviewProps {
  question: BuilderQuestion;
}

export function VideoRecordingPreview({ question }: VideoRecordingPreviewProps) {
  const maxDuration = question.settings?.maxDuration || "2:00";

  return (
    <div className="text-center space-y-4 py-4">
      <div className="w-full aspect-video max-w-xs mx-auto rounded-lg bg-muted flex items-center justify-center">
        <Video className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <Button size="lg" disabled className="gap-2">
        <Circle className="h-4 w-4 fill-red-500 text-red-500" />
        Start Recording
      </Button>
      <p className="text-xs text-muted-foreground">Max duration: {maxDuration}</p>
    </div>
  );
}
