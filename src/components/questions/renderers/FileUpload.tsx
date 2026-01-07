"use client";

import { useState, useCallback } from "react";
import { Upload, X, File, Image, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuestionRendererProps } from "../types";
import type { FileUploadSettings } from "@/lib/db/schema/files";
import { formatBytes } from "@/lib/upload";

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export function FileUpload({
  question,
  value,
  onChange,
  disabled,
}: QuestionRendererProps<UploadedFile[]>) {
  const settings = (question.settings || {}) as FileUploadSettings;
  const files = value || [];
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxFiles = settings.maxFiles || 10;
  const maxFileSize = settings.maxFileSize || 10 * 1024 * 1024; // 10MB default

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatBytes(maxFileSize)}.`;
    }

    if (settings.allowedTypes && settings.allowedTypes.length > 0) {
      const isAllowed = settings.allowedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      if (!isAllowed) {
        return `File type "${file.type}" is not allowed.`;
      }
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData();
    formData.append("file", file);
    if (settings.allowedTypes) {
      formData.append("allowedTypes", JSON.stringify(settings.allowedTypes));
    }
    formData.append("maxSize", String(maxFileSize));

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  };

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesToUpload = Array.from(fileList);
      const remainingSlots = maxFiles - files.length;

      if (filesToUpload.length > remainingSlots) {
        setError(`You can only upload ${remainingSlots} more file(s).`);
        return;
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);

      const newFiles: UploadedFile[] = [];
      let completed = 0;

      for (const file of filesToUpload) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        try {
          const result = await uploadFile(file);
          if (result) {
            newFiles.push(result);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
        }

        completed++;
        setUploadProgress((completed / filesToUpload.length) * 100);
      }

      if (newFiles.length > 0) {
        onChange([...files, ...newFiles]);
      }

      setUploading(false);
      setUploadProgress(0);
    },
    [files, maxFiles, maxFileSize, settings.allowedTypes, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleRemove = async (fileId: string) => {
    try {
      const fileToRemove = files.find((f) => f.id === fileId);
      if (fileToRemove) {
        await fetch(`/api/upload/${fileToRemove.filename}`, {
          method: "DELETE",
        });
      }
      onChange(files.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error("Failed to delete file:", err);
      // Still remove from UI even if delete fails
      onChange(files.filter((f) => f.id !== fileId));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-5 w-5" />;
    }
    if (mimeType.includes("pdf")) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const canUploadMore = files.length < maxFiles && !disabled;

  return (
    <div className="space-y-4">
      {canUploadMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !uploading) {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = maxFiles > 1;
              if (settings.allowedTypes) {
                input.accept = settings.allowedTypes.join(",");
              }
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) {
                  handleFiles(target.files);
                }
              };
              input.click();
            }
          }}
        >
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={uploadProgress} className="w-48 mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">
                Drag files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Max {maxFiles} files, {formatBytes(maxFileSize)} each
              </p>
              {settings.allowedTypes && (
                <p className="text-xs text-muted-foreground mt-1">
                  Allowed: {settings.allowedTypes.join(", ")}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="text-muted-foreground">
                {getFileIcon(file.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {file.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
              {file.mimeType.startsWith("image/") && (
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="h-10 w-10 object-cover rounded"
                />
              )}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(file.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!canUploadMore && files.length >= maxFiles && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum number of files reached
        </p>
      )}
    </div>
  );
}
