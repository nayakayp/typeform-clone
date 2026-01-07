"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GripVertical, Plus, Trash2, List, ImagePlus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export interface QuestionOption {
  id: string;
  label: string;
  value: string | null;
  image: string | null;
  order: number;
  questionId?: string;
}

interface OptionsEditorProps {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
  allowImages?: boolean;
}

interface SortableOptionItemProps {
  option: QuestionOption;
  index: number;
  onUpdate: (updates: Partial<QuestionOption>) => void;
  onDelete: () => void;
  allowImage?: boolean;
}

function SortableOptionItem({
  option,
  index,
  onUpdate,
  onDelete,
  allowImage,
}: SortableOptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-2",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 hover:bg-muted rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>

      {allowImage && option.image && (
        <img
          src={option.image}
          alt=""
          className="h-8 w-8 rounded object-cover"
        />
      )}

      <Input
        value={option.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Enter choice..."
        className="flex-1 h-8"
      />

      {allowImage && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) onUpdate({ image: url });
          }}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function OptionsEditor({
  options,
  onChange,
  allowImages = false,
}: OptionsEditorProps) {
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = options.findIndex((o) => o.id === active.id);
        const newIndex = options.findIndex((o) => o.id === over.id);

        const reordered = arrayMove(options, oldIndex, newIndex).map(
          (opt, idx) => ({
            ...opt,
            order: idx,
          })
        );

        onChange(reordered);
      }
    },
    [options, onChange]
  );

  const addOption = useCallback(() => {
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      label: "",
      value: null,
      image: null,
      order: options.length,
    };
    onChange([...options, newOption]);
  }, [options, onChange]);

  const updateOption = useCallback(
    (id: string, updates: Partial<QuestionOption>) => {
      onChange(
        options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt))
      );
    },
    [options, onChange]
  );

  const deleteOption = useCallback(
    (id: string) => {
      onChange(
        options
          .filter((opt) => opt.id !== id)
          .map((opt, idx) => ({ ...opt, order: idx }))
      );
    },
    [options, onChange]
  );

  const handleBulkAdd = useCallback(() => {
    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newOptions: QuestionOption[] = lines.map((label, idx) => ({
      id: crypto.randomUUID(),
      label,
      value: null,
      image: null,
      order: options.length + idx,
    }));

    onChange([...options, ...newOptions]);
    setBulkText("");
    setBulkAddOpen(false);
  }, [bulkText, options, onChange]);

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={options.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {options.map((option, index) => (
              <SortableOptionItem
                key={option.id}
                option={option}
                index={index}
                onUpdate={(updates) => updateOption(option.id, updates)}
                onDelete={() => deleteOption(option.id)}
                allowImage={allowImages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {options.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg">
          No choices yet. Add some below.
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addOption}
          className="flex-1 gap-1"
        >
          <Plus className="h-4 w-4" />
          Add choice
        </Button>

        <Dialog open={bulkAddOpen} onOpenChange={setBulkAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <List className="h-4 w-4" />
              Bulk add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add choices in bulk</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter one choice per line:
              </p>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Choice 1&#10;Choice 2&#10;Choice 3"
                rows={8}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBulkAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAdd} disabled={!bulkText.trim()}>
                  Add {bulkText.split("\n").filter((l) => l.trim()).length}{" "}
                  choices
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
