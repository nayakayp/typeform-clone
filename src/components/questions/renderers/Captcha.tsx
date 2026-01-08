"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "../types";

interface CaptchaSettings {
  captchaType?: "math" | "text" | "image";
  difficulty?: "easy" | "medium" | "hard";
}

interface CaptchaValue {
  verified: boolean;
  verifiedAt?: string;
}

// Generate a simple math captcha
function generateMathCaptcha(difficulty: string): { question: string; answer: number } {
  let num1: number, num2: number, operator: string, answer: number;

  switch (difficulty) {
    case "hard":
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      operator = ["+", "-", "×"][Math.floor(Math.random() * 3)];
      break;
    case "medium":
      num1 = Math.floor(Math.random() * 20) + 5;
      num2 = Math.floor(Math.random() * 20) + 5;
      operator = ["+", "-"][Math.floor(Math.random() * 2)];
      break;
    default: // easy
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operator = "+";
  }

  switch (operator) {
    case "+":
      answer = num1 + num2;
      break;
    case "-":
      // Ensure positive result
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      break;
    case "×":
      answer = num1 * num2;
      break;
    default:
      answer = num1 + num2;
  }

  return {
    question: `${num1} ${operator} ${num2} = ?`,
    answer,
  };
}

// Generate a text-based captcha
function generateTextCaptcha(): { text: string; display: string } {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  // Add some visual noise to the display
  const display = text.split("").join(" ");
  return { text, display };
}

export function Captcha({
  question,
  value,
  onChange,
  disabled,
  error,
}: QuestionRendererProps<CaptchaValue | null>) {
  const settings = (question.settings || {}) as CaptchaSettings;
  const captchaType = settings.captchaType || "math";
  const difficulty = settings.difficulty || "easy";

  const [captcha, setCaptcha] = useState<{
    question?: string;
    answer?: number;
    text?: string;
    display?: string;
  }>({});
  const [userInput, setUserInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);

  const generateCaptcha = useCallback(() => {
    setUserInput("");
    setShowError(false);

    if (captchaType === "math") {
      setCaptcha(generateMathCaptcha(difficulty));
    } else {
      setCaptcha(generateTextCaptcha());
    }
  }, [captchaType, difficulty]);

  useEffect(() => {
    if (!value?.verified) {
      generateCaptcha();
    }
  }, [generateCaptcha, value?.verified]);

  const handleVerify = () => {
    let isCorrect = false;

    if (captchaType === "math") {
      isCorrect = parseInt(userInput, 10) === captcha.answer;
    } else {
      isCorrect = userInput.toUpperCase() === captcha.text;
    }

    if (isCorrect) {
      onChange({
        verified: true,
        verifiedAt: new Date().toISOString(),
      });
    } else {
      setAttempts((prev) => prev + 1);
      setShowError(true);
      setUserInput("");

      // Regenerate after 3 failed attempts
      if (attempts >= 2) {
        generateCaptcha();
        setAttempts(0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  if (value?.verified) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
        <h3 className="mt-4 text-lg font-semibold text-green-900 dark:text-green-100">
          Verification Complete
        </h3>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          You have been verified as human
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm">Please verify you&apos;re human</span>
      </div>

      {/* Captcha Display */}
      <div className="rounded-lg border bg-muted/30 p-6">
        {captchaType === "math" ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Solve this math problem:
            </p>
            <p className="text-3xl font-bold font-mono tracking-wider">
              {captcha.question}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Type the characters you see:
            </p>
            <div
              className="inline-block rounded bg-gradient-to-r from-slate-200 to-slate-300 px-6 py-3 dark:from-slate-700 dark:to-slate-600"
              style={{
                fontFamily: "monospace",
                letterSpacing: "0.5em",
                background: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.03) 2px,
                    rgba(0,0,0,0.03) 4px
                  )
                `,
              }}
            >
              <span
                className="text-2xl font-bold select-none"
                style={{
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {captcha.display}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateCaptcha}
            disabled={disabled}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Challenge
          </Button>
        </div>
      </div>

      {/* Input and Verify */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={captchaType === "math" ? "Enter your answer" : "Type the characters"}
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setShowError(false);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "flex-1 text-center text-lg font-mono",
            showError && "border-destructive focus-visible:ring-destructive"
          )}
          autoComplete="off"
        />
        <Button onClick={handleVerify} disabled={disabled || !userInput}>
          Verify
        </Button>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="flex items-center justify-center gap-2 text-destructive">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">Incorrect. Please try again.</span>
        </div>
      )}

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
    </div>
  );
}
