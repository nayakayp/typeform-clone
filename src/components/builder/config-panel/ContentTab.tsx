"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BuilderQuestion } from "@/types/builder";
import { ImagePlus, X, Video } from "lucide-react";
import { useState } from "react";

interface ContentTabProps {
  question: BuilderQuestion;
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
}

export function ContentTab({ question, onUpdate }: ContentTabProps) {
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const handleMediaAdd = (url: string) => {
    if (mediaType === "image") {
      onUpdate({ image: url, video: null });
    } else {
      onUpdate({ video: url, image: null });
    }
    setShowMediaInput(false);
  };

  const handleMediaRemove = () => {
    onUpdate({ image: null, video: null });
  };

  return (
    <div className="space-y-6">
      {/* Placeholder (for input types) */}
      {["short_text", "long_text", "email", "phone", "number", "url"].includes(
        question.type
      ) && (
        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input
            id="placeholder"
            value={question.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value || null })}
            placeholder="Type your answer here..."
          />
        </div>
      )}

      {/* Media */}
      <div className="space-y-2">
        <Label>Image or Video</Label>

        {question.image || question.video ? (
          <div className="bg-muted/50 relative rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {question.image ? (
                <>
                  <ImagePlus className="text-muted-foreground h-8 w-8" />
                  <div className="flex-1 truncate text-sm">
                    {question.image}
                  </div>
                </>
              ) : (
                <>
                  <Video className="text-muted-foreground h-8 w-8" />
                  <div className="flex-1 truncate text-sm">
                    {question.video}
                  </div>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMediaRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : showMediaInput ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={mediaType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setMediaType("image")}
              >
                <ImagePlus className="mr-1 h-4 w-4" />
                Image
              </Button>
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setMediaType("video")}
              >
                <Video className="mr-1 h-4 w-4" />
                Video
              </Button>
            </div>
            <Input
              type="url"
              placeholder={`Enter ${mediaType} URL...`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMediaAdd((e.target as HTMLInputElement).value);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMediaInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMediaInput(true)}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add Image or Video
          </Button>
        )}
      </div>
    </div>
  );
}
