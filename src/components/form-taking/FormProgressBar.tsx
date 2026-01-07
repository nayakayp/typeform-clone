"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FormProgressBarProps } from "@/lib/form-taking/types";

/**
 * FormProgressBar - Shows form completion progress
 * Supports multiple display types: bar, dots, percentage, steps
 */
export function FormProgressBar({
  current,
  total,
  type = "bar",
  position = "top",
  showPercentage = true,
  color,
  className,
}: FormProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  if (type === "none") {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full",
        position === "top"
          ? "fixed top-0 right-0 left-0 z-50"
          : "fixed right-0 bottom-0 left-0 z-50",
        className
      )}
    >
      {type === "bar" && (
        <BarProgress
          percentage={percentage}
          showPercentage={showPercentage}
          color={color}
        />
      )}

      {type === "dots" && (
        <DotsProgress current={current} total={total} color={color} />
      )}

      {type === "percentage" && (
        <PercentageProgress percentage={percentage} color={color} />
      )}

      {type === "steps" && (
        <StepsProgress current={current} total={total} color={color} />
      )}
    </div>
  );
}

interface BarProgressProps {
  percentage: number;
  showPercentage: boolean;
  color?: string;
}

function BarProgress({ percentage, showPercentage, color }: BarProgressProps) {
  return (
    <div className="relative">
      <div className="bg-muted h-1 w-full">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color || "var(--primary)" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <div className="absolute top-2 right-4">
          <span
            className="text-xs font-medium"
            style={{ color: color || "var(--foreground)" }}
          >
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}

interface DotsProgressProps {
  current: number;
  total: number;
  color?: string;
}

function DotsProgress({ current, total, color }: DotsProgressProps) {
  // Limit dots to prevent overflow
  const maxDots = Math.min(total, 10);
  const step = total / maxDots;

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: maxDots }).map((_, index) => {
        const dotIndex = Math.round(index * step);
        const isActive = current >= dotIndex;
        const isCurrent = Math.floor(current / step) === index;

        return (
          <motion.div
            key={index}
            className={cn(
              "rounded-full transition-all",
              isCurrent ? "h-2.5 w-2.5" : "h-2 w-2"
            )}
            style={{
              backgroundColor: isActive
                ? color || "var(--primary)"
                : "var(--muted)",
            }}
            initial={{ scale: 0.8 }}
            animate={{
              scale: isCurrent ? 1.2 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        );
      })}
    </div>
  );
}

interface PercentageProgressProps {
  percentage: number;
  color?: string;
}

function PercentageProgress({ percentage, color }: PercentageProgressProps) {
  return (
    <div className="flex items-center justify-center py-3">
      <motion.div
        className="relative flex h-12 w-12 items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background circle */}
        <svg className="h-12 w-12 -rotate-90 transform">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="var(--muted)"
            strokeWidth="4"
            fill="none"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke={color || "var(--primary)"}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 126" }}
            animate={{
              strokeDasharray: `${(percentage / 100) * 126} 126`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <span
          className="absolute text-xs font-semibold"
          style={{ color: color || "var(--foreground)" }}
        >
          {percentage}%
        </span>
      </motion.div>
    </div>
  );
}

interface StepsProgressProps {
  current: number;
  total: number;
  color?: string;
}

function StepsProgress({ current, total, color }: StepsProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <span
        className="text-sm font-medium"
        style={{ color: color || "var(--foreground)" }}
      >
        {current}
      </span>
      <span className="text-muted-foreground text-sm">/</span>
      <span className="text-muted-foreground text-sm">{total}</span>
    </div>
  );
}
