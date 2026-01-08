"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { useAutosave } from "@/hooks/use-autosave";
import { QuestionSidebar } from "./question-sidebar";
import { BuilderCanvas } from "./builder-canvas";
import { SettingsPanel } from "./settings-panel";
import { BuilderHeader } from "./builder-header";
import { QuestionConfigPanel } from "./config-panel";
import type { Form } from "@/lib/db/schema/forms";
import type { BuilderQuestion } from "@/types/builder";

interface BuilderLayoutProps {
  form: Form;
  questions: BuilderQuestion[];
}

export function BuilderLayout({ form, questions }: BuilderLayoutProps) {
  const { setForm, resetBuilder } = useBuilderStore();

  // Enable autosave
  useAutosave();

  useEffect(() => {
    setForm(form, questions);

    return () => {
      resetBuilder();
    };
  }, [form, questions, setForm, resetBuilder]);

  return (
    <div className="flex h-screen flex-col">
      <BuilderHeader />
      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar />
        <BuilderCanvas />
        <SettingsPanel />
      </div>
      <QuestionConfigPanel />
    </div>
  );
}
