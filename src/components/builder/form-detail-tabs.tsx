"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { BuilderLayout } from "./builder-layout";
import { FormResponses } from "@/components/responses/FormResponses";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { Form } from "@/lib/db/schema/forms";
import type { BuilderQuestion } from "@/types/builder";
import { FileText, MessageSquare, BarChart3 } from "lucide-react";

type TabValue = "questions" | "responses" | "analytics";

interface FormDetailTabsProps {
  form: Form;
  questions: BuilderQuestion[];
  currentTab: TabValue;
}

const tabs = [
  { value: "questions" as const, label: "Questions", icon: FileText },
  { value: "responses" as const, label: "Responses", icon: MessageSquare },
  { value: "analytics" as const, label: "Analytics", icon: BarChart3 },
];

export function FormDetailTabs({
  form,
  questions,
  currentTab,
}: FormDetailTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: TabValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="-mx-6 flex h-screen flex-col">
      {/* Tab bar - only show when not on questions tab */}
      {currentTab !== "questions" && (
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
          <div className="container">
            <nav className="-mb-px flex justify-end gap-1" aria-label="Form sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-transparent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Tab content */}
      <div
        className={cn("flex-1", currentTab !== "questions" && "overflow-auto")}
      >
        {currentTab === "questions" && (
          <BuilderLayoutWithTabs
            form={form}
            questions={questions}
            onTabChange={handleTabChange}
            currentTab={currentTab}
          />
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

// Wrapper that adds tab navigation to the builder header area
function BuilderLayoutWithTabs({
  form,
  questions,
  onTabChange,
  currentTab,
}: {
  form: Form;
  questions: BuilderQuestion[];
  onTabChange: (tab: TabValue) => void;
  currentTab: TabValue;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Mini tab bar that appears above the builder - aligned right */}
      <div className="flex items-center justify-end gap-1 border-b bg-muted/30 px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1">
        <BuilderLayout form={form} questions={questions} />
      </div>
    </div>
  );
}
