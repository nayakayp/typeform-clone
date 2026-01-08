import { ImagePlus } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface ImageBlockPreviewProps {
  question: BuilderQuestion;
}

export function ImageBlockPreview({ question }: ImageBlockPreviewProps) {
  const image = question.image;

  return (
    <div className="text-center">
      {image ? (
        <img
          src={image}
          alt={question.title || "Image"}
          className="max-h-64 mx-auto rounded-lg object-contain"
        />
      ) : (
        <div className="aspect-video max-w-md mx-auto rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
          <ImagePlus className="h-12 w-12 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload image</p>
        </div>
      )}
    </div>
  );
}
