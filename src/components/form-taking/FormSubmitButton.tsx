"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { FormSubmitButtonProps } from "@/lib/form-taking/types";

/**
 * FormSubmitButton - Submit button with loading state
 */
export function FormSubmitButton({
  isSubmitting,
  disabled,
  onClick,
  className,
}: FormSubmitButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        size="lg"
        onClick={onClick}
        disabled={disabled || isSubmitting}
        className={cn("gap-2 text-lg", className)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Submit
          </>
        )}
      </Button>
    </motion.div>
  );
}

/**
 * Animated submit button that shows checkmark on success
 */
export function FormSubmitButtonAnimated({
  isSubmitting,
  isSubmitted,
  disabled,
  onClick,
  className,
}: FormSubmitButtonProps & { isSubmitted?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        size="lg"
        onClick={onClick}
        disabled={disabled || isSubmitting || isSubmitted}
        className={cn(
          "relative gap-2 overflow-hidden text-lg transition-all duration-300",
          isSubmitted && "bg-green-600 hover:bg-green-600",
          className
        )}
      >
        <motion.div
          className="flex items-center gap-2"
          initial={false}
          animate={{
            opacity: isSubmitting || isSubmitted ? 0 : 1,
            y: isSubmitting || isSubmitted ? -20 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <Send className="h-5 w-5" />
          Submit
        </motion.div>

        {/* Loading state */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isSubmitting ? 1 : 0,
            y: isSubmitting ? 0 : 20,
          }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </motion.div>

        {/* Success state */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: isSubmitted ? 1 : 0,
            scale: isSubmitted ? 1 : 0.5,
          }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <Check className="h-6 w-6" />
        </motion.div>
      </Button>
    </motion.div>
  );
}
