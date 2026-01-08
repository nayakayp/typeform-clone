"use client";

import { BuilderLayout } from "./builder-layout";
import { FormResponses } from "@/components/responses/FormResponses";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { Form } from "@/lib/db/schema/forms";
import type { BuilderQuestion } from "@/types/builder";

type TabValue = "questions" | "responses" | "analytics";

interface FormDetailTabsProps {
  form: Form;
  questions: BuilderQuestion[];
  currentTab: TabValue;
}

export function FormDetailTabs({
  form,
  questions,
  currentTab,
}: FormDetailTabsProps) {
  return (
    <div className="-mx-6 flex h-screen flex-col">
      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {currentTab === "questions" && (
          <BuilderLayout form={form} questions={questions} />
        )}
        {currentTab === "responses" && (
          <div className="container py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                {form.title}
              </h1>
              <p className="text-muted-foreground">View and manage responses</p>
            </div>
            <FormResponses formId={form.id} />
          </div>
        )}
        {currentTab === "analytics" && (
          <div className="container py-8">
            <AnalyticsDashboard formId={form.id} />
          </div>
        )}
      </div>
    </div>
  );
}
