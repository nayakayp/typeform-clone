"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <div className="container max-w-5xl py-8">
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2" asChild>
                <Link href={`/forms/${form.id}/edit`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Editor
                </Link>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">
                {form.title}
              </h1>
              <p className="text-muted-foreground">View and manage responses</p>
            </div>
            <FormResponses formId={form.id} />
          </div>
        )}
        {currentTab === "analytics" && (
          <div className="container max-w-5xl py-8">
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2" asChild>
                <Link href={`/forms/${form.id}/edit`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Editor
                </Link>
              </Button>
            </div>
            <AnalyticsDashboard formId={form.id} />
          </div>
        )}
      </div>
    </div>
  );
}
