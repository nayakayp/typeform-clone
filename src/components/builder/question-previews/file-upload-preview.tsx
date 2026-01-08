import { Upload } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface FileUploadPreviewProps {
  question: BuilderQuestion;
}

export function FileUploadPreview({ question }: FileUploadPreviewProps) {
  const maxSize = question.settings?.maxFileSize || "10MB";
  const allowedTypes = question.settings?.allowedFileTypes || "All files";

  return (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
      <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        Drag and drop or click to upload
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        {allowedTypes} • Max {maxSize}
      </p>
    </div>
  );
}
