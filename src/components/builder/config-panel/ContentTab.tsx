"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      {/* Question Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Question</Label>
        <Textarea
          id="title"
          value={question.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Your question here..."
          className="min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use @ to insert previous answers (piping)
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={question.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value || null })}
          placeholder="Add a description or helper text..."
          className="min-h-[60px] resize-none"
        />
      </div>

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

        {(question.image || question.video) ? (
          <div className="relative rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              {question.image ? (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 truncate text-sm">
                    {question.image}
                  </div>
                </>
              ) : (
                <>
                  <Video className="h-8 w-8 text-muted-foreground" />
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
                <ImagePlus className="h-4 w-4 mr-1" />
                Image
              </Button>
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setMediaType("video")}
              >
                <Video className="h-4 w-4 mr-1" />
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
            <ImagePlus className="h-4 w-4 mr-2" />
            Add Image or Video
          </Button>
        )}
      </div>
    </div>
  );
}
