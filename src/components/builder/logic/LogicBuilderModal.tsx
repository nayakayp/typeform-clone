"use client";

import * as React from "react";
import { Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ConditionRow } from "./ConditionRow";
import { ActionSelector } from "./ActionSelector";
import type {
  LogicCondition,
  SkipLogic,
  VisibilityLogic,
  SkipLogicAction,
} from "@/lib/logic/types";
import type { BuilderQuestion } from "@/types/builder";

type LogicType = "skip" | "visibility";

interface LogicBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: BuilderQuestion;
  questions: BuilderQuestion[];
  skipLogic?: SkipLogic;
  visibilityLogic?: VisibilityLogic;
  onSaveSkipLogic: (logic: SkipLogic | null) => void;
  onSaveVisibilityLogic: (logic: VisibilityLogic | null) => void;
}

export function LogicBuilderModal({
  open,
  onOpenChange,
  question,
  questions,
  skipLogic,
  visibilityLogic,
  onSaveSkipLogic,
  onSaveVisibilityLogic,
}: LogicBuilderModalProps) {
  const [activeTab, setActiveTab] = React.useState<LogicType>("skip");

  // Skip logic state
  const [skipConditions, setSkipConditions] = React.useState<LogicCondition[]>(
    skipLogic?.conditions || []
  );
  const [skipOperator, setSkipOperator] = React.useState<"and" | "or">(
    skipLogic?.operator || "and"
  );
  const [skipAction, setSkipAction] = React.useState<SkipLogicAction>(
    skipLogic?.action || { type: "jump_to" }
  );

  // Visibility logic state
  const [visibilityConditions, setVisibilityConditions] = React.useState<
    LogicCondition[]
  >(visibilityLogic?.showIf || []);
  const [visibilityOperator, setVisibilityOperator] = React.useState<
    "and" | "or"
  >(visibilityLogic?.operator || "and");

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setSkipConditions(skipLogic?.conditions || []);
      setSkipOperator(skipLogic?.operator || "and");
      setSkipAction(skipLogic?.action || { type: "jump_to" });
      setVisibilityConditions(visibilityLogic?.showIf || []);
      setVisibilityOperator(visibilityLogic?.operator || "and");
    }
  }, [open, skipLogic, visibilityLogic]);

  // Add a new condition
  const handleAddCondition = (type: LogicType) => {
    const newCondition: LogicCondition = {
      field: "",
      operator: "equals",
      value: undefined,
    };

    if (type === "skip") {
      setSkipConditions([...skipConditions, newCondition]);
    } else {
      setVisibilityConditions([...visibilityConditions, newCondition]);
    }
  };

  // Update a condition
  const handleConditionChange = (
    type: LogicType,
    index: number,
    condition: LogicCondition
  ) => {
    if (type === "skip") {
      const newConditions = [...skipConditions];
      newConditions[index] = condition;
      setSkipConditions(newConditions);
    } else {
      const newConditions = [...visibilityConditions];
      newConditions[index] = condition;
      setVisibilityConditions(newConditions);
    }
  };

  // Remove a condition
  const handleRemoveCondition = (type: LogicType, index: number) => {
    if (type === "skip") {
      setSkipConditions(skipConditions.filter((_, i) => i !== index));
    } else {
      setVisibilityConditions(
        visibilityConditions.filter((_, i) => i !== index)
      );
    }
  };

  // Save logic
  const handleSave = () => {
    // Save skip logic
    if (skipConditions.length > 0 && skipConditions.some((c) => c.field)) {
      const validConditions = skipConditions.filter((c) => c.field);
      onSaveSkipLogic({
        questionId: question.id,
        conditions: validConditions,
        operator: skipOperator,
        action: skipAction,
      });
    } else {
      onSaveSkipLogic(null);
    }

    // Save visibility logic
    if (
      visibilityConditions.length > 0 &&
      visibilityConditions.some((c) => c.field)
    ) {
      const validConditions = visibilityConditions.filter((c) => c.field);
      onSaveVisibilityLogic({
        questionId: question.id,
        showIf: validConditions,
        operator: visibilityOperator,
      });
    } else {
      onSaveVisibilityLogic(null);
    }

    onOpenChange(false);
  };

  // Clear all logic
  const handleClearAll = () => {
    if (activeTab === "skip") {
      setSkipConditions([]);
      setSkipAction({ type: "jump_to" });
    } else {
      setVisibilityConditions([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Logic Builder
          </DialogTitle>
          <DialogDescription>
            Configure conditional logic for this question. Add conditions to
            control the form flow.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as LogicType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="skip">Skip Logic</TabsTrigger>
            <TabsTrigger value="visibility">Show/Hide</TabsTrigger>
          </TabsList>

          {/* Skip Logic Tab */}
          <TabsContent value="skip" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  If these conditions are met:
                </Label>
                {skipConditions.length > 1 && (
                  <Select
                    value={skipOperator}
                    onValueChange={(value) =>
                      setSkipOperator(value as "and" | "or")
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">AND</SelectItem>
                      <SelectItem value="or">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                {skipConditions.map((condition, index) => (
                  <ConditionRow
                    key={index}
                    condition={condition}
                    index={index}
                    questions={questions}
                    currentQuestionId={question.id}
                    onChange={(i, c) => handleConditionChange("skip", i, c)}
                    onRemove={(i) => handleRemoveCondition("skip", i)}
                    showRemove={skipConditions.length > 1}
                  />
                ))}

                {skipConditions.length === 0 && (
                  <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                    No conditions added. Add a condition to enable skip logic.
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddCondition("skip")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Condition
              </Button>

              {skipConditions.length > 0 &&
                skipConditions.some((c) => c.field) && (
                  <div className="border-t pt-4">
                    <ActionSelector
                      action={skipAction}
                      questions={questions}
                      currentQuestionId={question.id}
                      onChange={setSkipAction}
                    />
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Visibility Logic Tab */}
          <TabsContent value="visibility" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Show this question if:
                </Label>
                {visibilityConditions.length > 1 && (
                  <Select
                    value={visibilityOperator}
                    onValueChange={(value) =>
                      setVisibilityOperator(value as "and" | "or")
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">AND</SelectItem>
                      <SelectItem value="or">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                {visibilityConditions.map((condition, index) => (
                  <ConditionRow
                    key={index}
                    condition={condition}
                    index={index}
                    questions={questions}
                    currentQuestionId={question.id}
                    onChange={(i, c) =>
                      handleConditionChange("visibility", i, c)
                    }
                    onRemove={(i) => handleRemoveCondition("visibility", i)}
                    showRemove={visibilityConditions.length > 1}
                  />
                ))}

                {visibilityConditions.length === 0 && (
                  <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                    No conditions added. This question will always be visible.
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddCondition("visibility")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Condition
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleClearAll}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Logic</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
