import { useEffect, useRef, useCallback } from "react";
import { useBuilderStore } from "@/stores/builder-store";

const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useAutosave() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    form,
    questions,
    isDirty,
    isSaving,
    setSaving,
    setSaveError,
    markSaved,
  } = useBuilderStore();

  const save = useCallback(async () => {
    if (!form || !isDirty || isSaving) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Save form metadata
      const formResponse = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          settings: form.settings,
          customTheme: form.customTheme,
        }),
      });

      if (!formResponse.ok) {
        throw new Error("Failed to save form");
      }

      // Save questions
      const questionsResponse = await fetch(`/api/forms/${form.id}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!questionsResponse.ok) {
        throw new Error("Failed to save questions");
      }

      markSaved();
    } catch (error) {
      console.error("Autosave error:", error);
      setSaveError(error instanceof Error ? error.message : "Save failed");
      setSaving(false);
    }
  }, [form, questions, isDirty, isSaving, setSaving, setSaveError, markSaved]);

  // Debounced autosave on changes
  useEffect(() => {
    if (!isDirty) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, save]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty && form) {
        save();
      }
    };
  }, [isDirty, form, save]);

  return { save, isSaving };
}
