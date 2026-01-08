import { Youtube, Play } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface VideoEmbedPreviewProps {
  question: BuilderQuestion;
}

export function VideoEmbedPreview({ question }: VideoEmbedPreviewProps) {
  const videoUrl = question.video || "";

  return (
    <div className="space-y-3">
      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
        {videoUrl ? (
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground truncate max-w-xs">{videoUrl}</p>
          </div>
        ) : (
          <div className="text-center">
            <Youtube className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mt-2">Paste video URL</p>
          </div>
        )}
      </div>
      <input
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="https://youtube.com/watch?v=..."
        defaultValue={videoUrl}
      />
    </div>
  );
}
