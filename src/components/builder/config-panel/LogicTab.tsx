"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";

interface LogicTabProps {
  question: BuilderQuestion;
}

export function LogicTab({ question }: LogicTabProps) {
  const hasLogic = question.logicJump !== null;

  return (
    <div className="space-y-6">
      {/* Logic rules summary */}
      {hasLogic ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Applied Logic</h4>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Jump Logic</p>
                <p className="text-xs text-muted-foreground">
                  This question has conditional jump logic configured.
                  Edit it in the Logic & Branching section.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium mb-2">No logic applied</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add logic to show or hide this question based on previous answers,
            or jump to different questions.
          </p>
        </div>
      )}

      {/* Add logic button */}
      <Button variant="outline" className="w-full gap-2">
        <Plus className="h-4 w-4" />
        {hasLogic ? "Edit Logic" : "Add Logic"}
      </Button>

      {/* Logic types info */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">
          Available Logic Types
        </h4>
        <div className="space-y-2">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Jump Logic</p>
            <p className="text-xs text-muted-foreground">
              Skip to a specific question based on the answer
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Conditional Display</p>
            <p className="text-xs text-muted-foreground">
              Show or hide this question based on conditions
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Calculations</p>
            <p className="text-xs text-muted-foreground">
              Calculate values based on other answers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
