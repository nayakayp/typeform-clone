"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStep {
  questionId: string;
  title: string;
  order: number;
  reached: number;
  answered: number;
  droppedOff: number;
  dropOffRate: number;
  avgTimeSpent: number;
}

interface DropOffFunnelProps {
  steps: FunnelStep[];
  title?: string;
}

export function DropOffFunnel({
  steps,
  title = "Drop-off Analysis",
}: DropOffFunnelProps) {
  if (steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxReached = Math.max(...steps.map((s) => s.reached), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const percentage = (step.reached / maxReached) * 100;
            const isHighDropOff = step.dropOffRate > 20;

            return (
              <div key={step.questionId} className="relative">
                {/* Bar */}
                <div className="relative h-12 rounded-md bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-md transition-all",
                      isHighDropOff ? "bg-orange-500/80" : "bg-primary/80"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-sm font-medium truncate max-w-[60%] z-10">
                      {step.order + 1}. {step.title}
                    </span>
                    <div className="flex items-center gap-3 text-sm z-10">
                      <span className="font-medium">{step.reached}</span>
                      {step.dropOffRate > 0 && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isHighDropOff
                              ? "bg-red-100 text-red-700"
                              : "bg-muted-foreground/10 text-muted-foreground"
                          )}
                        >
                          -{step.dropOffRate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drop-off indicator between steps */}
                {index < steps.length - 1 && step.droppedOff > 0 && (
                  <div className="flex items-center gap-2 pl-4 py-1 text-xs text-muted-foreground">
                    <div className="w-0.5 h-4 bg-red-400" />
                    <span>
                      {step.droppedOff} dropped off ({step.dropOffRate.toFixed(1)}
                      %)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
