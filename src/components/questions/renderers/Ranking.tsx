"use client";

import { useMemo } from "react";
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
import { GripVertical } from "lucide-react";
import type {
  QuestionRendererProps,
  RankingSettings,
  ChoiceOption,
} from "../types";

interface SortableItemProps {
  item: ChoiceOption;
  rank: number;
  disabled?: boolean;
}

function SortableItem({ item, rank, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-background flex items-center gap-3 rounded-lg border p-3 transition-shadow",
        isDragging && "ring-primary shadow-lg ring-2",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <button
        type="button"
        className={cn(
          "text-muted-foreground hover:text-foreground cursor-grab touch-none",
          isDragging && "cursor-grabbing",
          disabled && "cursor-not-allowed"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
        {rank}
      </span>

      <span className="flex-1">{item.label}</span>
    </div>
  );
}

export function Ranking({
  question,
  value,
  onChange,
  error,
  disabled,
}: QuestionRendererProps<string[]>) {
  const settings = question.settings as RankingSettings;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const orderedItems = useMemo(() => {
    const options = settings?.options || [];
    if (!value || value.length === 0) {
      return options;
    }
    const orderedOptions: ChoiceOption[] = [];
    for (const id of value) {
      const option = options.find((o) => o.id === id);
      if (option) {
        orderedOptions.push(option);
      }
    }
    for (const option of options) {
      if (!value.includes(option.id)) {
        orderedOptions.push(option);
      }
    }
    return orderedOptions;
  }, [settings?.options, value]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
      const newIndex = orderedItems.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
      onChange(newOrder.map((item) => item.id));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Drag items to rank them in order of preference
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {orderedItems.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                rank={index + 1}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
