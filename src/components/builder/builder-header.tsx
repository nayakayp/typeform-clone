"use client";

import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Eye,
  Settings,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface BuilderHeaderProps {
  className?: string;
}

export function BuilderHeader({ className }: BuilderHeaderProps) {
  const {
    form,
    isDirty,
    isSaving,
    lastSavedAt,
    saveError,
    updateFormMeta,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useBuilderStore();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormMeta({ title: e.target.value });
  };

  const formatLastSaved = () => {
    if (!lastSavedAt) return null;
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `Saved ${minutes}m ago`;
    }
    if (seconds > 0) {
      return `Saved ${seconds}s ago`;
    }
    return "Just saved";
  };

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Link href="/forms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Input
          value={form?.title || ""}
          onChange={handleTitleChange}
          className="h-8 w-64 border-0 bg-transparent px-2 text-base font-semibold shadow-none focus-visible:ring-1"
          placeholder="Untitled Form"
        />

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isSaving && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {!isSaving && saveError && (
            <span className="text-destructive">Save failed</span>
          )}
          {!isSaving && !saveError && isDirty && (
            <span>Unsaved changes</span>
          )}
          {!isSaving && !saveError && !isDirty && formatLastSaved() && (
            <span>{formatLastSaved()}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canUndo()}
            onClick={undo}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canRedo()}
            onClick={redo}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href={form ? `/f/${form.slug}` : "#"} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>

        {form?.status === "published" && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/f/${form.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Live
            </Link>
          </Button>
        )}

        <Button variant="ghost" size="sm" asChild>
          <Link href={form ? `/forms/${form.id}/settings` : "#"}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>

        <Button size="sm" disabled={!isDirty || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
