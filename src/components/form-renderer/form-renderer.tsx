"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  QuestionRenderers,
  ContentBlockRenderers,
} from "@/components/questions/renderers";
import type { Question as DBQuestion } from "@/lib/db/schema/questions";
import type { CustomTheme } from "@/lib/db/schema/forms";
import { DEFAULT_THEME } from "@/lib/theme/defaults";
import {
  FONT_SIZE_MAP,
  LINE_HEIGHT_MAP,
  RADIUS_MAP,
  ANIMATION_SPEED_MAP,
} from "@/lib/theme/types";
import type { Theme } from "@/lib/theme/types";

// Load Google Font dynamically
function loadGoogleFont(fontFamily: string) {
  if (typeof window === "undefined") return;

  const fontName = fontFamily.replace(/\s+/g, "+");
  const linkId = `google-font-${fontName}`;

  // Check if already loaded
  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  image?: string | null;
  order: number;
}

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  placeholder?: string | null;
  order: number;
  required: boolean;
  validations?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  image?: string | null;
  video?: string | null;
  options?: QuestionOption[];
}

interface FormData {
  id: string;
  title: string;
  description?: string | null;
  settings?: {
    showProgressBar?: boolean;
    showQuestionNumbers?: boolean;
    oneQuestionPerPage?: boolean;
  };
  customTheme?: CustomTheme;
  theme?: CustomTheme;
  questions: Question[];
}

interface FormRendererProps {
  form: FormData;
  slug: string;
}

type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>
  | null;

// Content block types that don't require answers
const CONTENT_BLOCK_TYPES = [
  "welcome_screen",
  "thank_you_screen",
  "statement",
  "redirect",
  "video_embed",
  "image_block",
];

// Convert local Question to DB Question format for renderers
function toDBQuestion(question: Question): DBQuestion {
  return {
    id: question.id,
    formId: "", // Not needed for rendering
    type: question.type as DBQuestion["type"],
    title: question.title,
    description: question.description ?? null,
    placeholder: question.placeholder ?? null,
    order: question.order,
    groupId: null,
    required: question.required ?? false,
    validations: (question.validations as DBQuestion["validations"]) ?? {},
    settings: {
      ...((question.settings as Record<string, unknown>) ?? {}),
      // Merge options into settings for renderers that expect it there
      options: question.options?.map((opt) => ({
        id: opt.id,
        label: opt.label,
        value: opt.value || opt.id,
        image: opt.image,
        order: opt.order,
      })),
    } as DBQuestion["settings"],
    image: question.image ?? null,
    video: question.video ?? null,
    logicJump: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function FormRenderer({ form, slug }: FormRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev">(
    "next"
  );
  const [animationPhase, setAnimationPhase] = useState<"idle" | "exiting" | "entering">("idle");

  const allQuestions = form.questions;
  const oneQuestionPerPage = form.settings?.oneQuestionPerPage ?? true;

  // Find special screens
  const welcomeScreen = allQuestions.find((q) => q.type === "welcome_screen");
  const thankYouScreen = allQuestions.find(
    (q) => q.type === "thank_you_screen"
  );

  // Filter content questions (answerable ones)
  const contentQuestions = allQuestions.filter(
    (q) => !["welcome_screen", "thank_you_screen"].includes(q.type)
  );

  const currentQuestion = oneQuestionPerPage
    ? contentQuestions[currentIndex]
    : null;

  const progress =
    contentQuestions.length > 0
      ? ((currentIndex + 1) / contentQuestions.length) * 100
      : 0;

  // Build full theme from customTheme (handles both legacy and new format)
  const theme = useMemo(() => {
    const customTheme = form.customTheme || form.theme;
    if (!customTheme) {
      return { ...DEFAULT_THEME };
    }

    // Start with defaults
    const mergedTheme: Theme = { ...DEFAULT_THEME };

    // If we have the new full theme structure, use it
    if (customTheme.colors) {
      mergedTheme.colors = { ...DEFAULT_THEME.colors, ...customTheme.colors };
    } else {
      // Legacy: map old simple fields to new structure
      mergedTheme.colors = {
        ...DEFAULT_THEME.colors,
        primary: customTheme.primaryColor || DEFAULT_THEME.colors.primary,
        background:
          customTheme.backgroundColor || DEFAULT_THEME.colors.background,
        foreground: customTheme.textColor || DEFAULT_THEME.colors.foreground,
        questionText:
          customTheme.textColor || DEFAULT_THEME.colors.questionText,
      };
    }

    if (customTheme.background) {
      mergedTheme.background = {
        ...DEFAULT_THEME.background,
        type: customTheme.background.type || DEFAULT_THEME.background.type,
        color: customTheme.background.color || DEFAULT_THEME.background.color,
        gradient: customTheme.background.gradient
          ? {
              type: customTheme.background.gradient.type || "linear",
              angle: customTheme.background.gradient.angle ?? 180,
              stops: customTheme.background.gradient.stops || [],
            }
          : undefined,
        image: customTheme.background.image
          ? {
              url: customTheme.background.image.url || "",
              size: customTheme.background.image.size || "cover",
              position: customTheme.background.image.position || "center",
              repeat: customTheme.background.image.repeat || "no-repeat",
              overlay: customTheme.background.image.overlay,
            }
          : undefined,
      };
    } else if (customTheme.backgroundImage) {
      // Legacy: map old backgroundImage to new structure
      mergedTheme.background = {
        type: "image",
        image: {
          url: customTheme.backgroundImage,
          size: "cover",
          position: "center",
          repeat: "no-repeat",
        },
      };
    }

    if (customTheme.typography) {
      mergedTheme.typography = {
        ...DEFAULT_THEME.typography,
        ...customTheme.typography,
      };
    } else if (customTheme.fontFamily) {
      // Legacy: map old fontFamily to new structure
      mergedTheme.typography = {
        ...DEFAULT_THEME.typography,
        fontFamily: customTheme.fontFamily,
        headingFontFamily: customTheme.fontFamily,
      };
    }

    if (customTheme.layout) {
      mergedTheme.layout = { ...DEFAULT_THEME.layout, ...customTheme.layout };
    }

    if (customTheme.buttons) {
      mergedTheme.buttons = {
        ...DEFAULT_THEME.buttons,
        ...customTheme.buttons,
      };
    }

    if (customTheme.progressBar) {
      mergedTheme.progressBar = {
        ...DEFAULT_THEME.progressBar,
        ...customTheme.progressBar,
      };
    }

    if (customTheme.formElements) {
      mergedTheme.formElements = {
        ...DEFAULT_THEME.formElements,
        ...customTheme.formElements,
      };
    }

    if (customTheme.branding) {
      mergedTheme.branding = {
        ...DEFAULT_THEME.branding,
        ...customTheme.branding,
      };
    }

    if (customTheme.animations) {
      mergedTheme.animations = {
        ...DEFAULT_THEME.animations,
        ...customTheme.animations,
      };
    }

    return mergedTheme;
  }, [form.customTheme, form.theme]);

  // Load Google Fonts dynamically
  useEffect(() => {
    if (theme.typography.fontFamily) {
      loadGoogleFont(theme.typography.fontFamily);
    }
    if (
      theme.typography.headingFontFamily &&
      theme.typography.headingFontFamily !== theme.typography.fontFamily
    ) {
      loadGoogleFont(theme.typography.headingFontFamily);
    }
  }, [theme.typography.fontFamily, theme.typography.headingFontFamily]);

  // Extract theme values for easier use
  const primaryColor = theme.colors.primary;
  const backgroundColor = theme.colors.background;
  const textColor = theme.colors.foreground;

  // Build CSS styles from theme
  const themeStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      "--primary": theme.colors.primary,
      "--foreground": theme.colors.foreground,
      "--background": theme.colors.background,
      "--muted": theme.colors.muted,
      "--muted-foreground": theme.colors.mutedForeground,
      "--border": theme.colors.border,
      "--input": theme.colors.input,
      "--ring": theme.colors.ring,
      "--accent": theme.colors.accent,
      "--accent-foreground": theme.colors.accentForeground,
      "--destructive": theme.colors.destructive,
      "--radius": RADIUS_MAP[theme.buttons.radius],
      fontFamily: `"${theme.typography.fontFamily}", system-ui, sans-serif`,
      fontSize: FONT_SIZE_MAP[theme.typography.fontSize].base,
      lineHeight: LINE_HEIGHT_MAP[theme.typography.lineHeight],
      color: theme.colors.foreground,
    } as React.CSSProperties;

    // Background
    if (theme.background.type === "solid" && theme.background.color) {
      styles.backgroundColor = theme.background.color;
    } else if (
      theme.background.type === "gradient" &&
      theme.background.gradient
    ) {
      const { type, angle, stops } = theme.background.gradient;
      const gradientStops = stops
        .map((s) => `${s.color} ${s.position}%`)
        .join(", ");
      styles.background =
        type === "linear"
          ? `linear-gradient(${angle}deg, ${gradientStops})`
          : `radial-gradient(circle, ${gradientStops})`;
    } else {
      styles.backgroundColor = theme.colors.background;
    }

    return styles;
  }, [theme]);

  // Background image styles (separate for overlay support)
  const backgroundImageStyles = useMemo(() => {
    if (theme.background.type !== "image" || !theme.background.image) {
      return null;
    }

    const { url, size, position, overlay } = theme.background.image;
    return {
      backgroundImage: `url(${url})`,
      backgroundSize: size,
      backgroundPosition: position,
      overlay,
    };
  }, [theme.background]);

  // Get staggered animation styles based on theme configuration
  const getStaggeredAnimationStyles = (staggerIndex: number): React.CSSProperties => {
    const transition = theme.animations.transition;
    const duration = ANIMATION_SPEED_MAP[theme.animations.speed];
    const staggerDelay = staggerIndex * 100; // 100ms delay between each element

    if (transition === "none") {
      return {};
    }

    const baseTransition = `all ${duration}ms ease-out ${staggerDelay}ms`;

    // Idle state - fully visible
    if (animationPhase === "idle") {
      return {
        opacity: 1,
        transform: "translateY(0) scale(1) rotateX(0)",
        transition: `all ${duration}ms ease-out`,
      };
    }

    // Exiting state - animate out
    if (animationPhase === "exiting") {
      switch (transition) {
        case "fade":
          return {
            opacity: 0,
            transition: baseTransition,
          };
        case "slide":
          const exitOffset = animationDirection === "next" ? "-50vh" : "50vh";
          return {
            opacity: 0,
            transform: `translateY(${exitOffset})`,
            transition: baseTransition,
          };
        case "zoom":
          return {
            opacity: 0,
            transform: "scale(0.8)",
            transition: baseTransition,
          };
        case "flip":
          return {
            opacity: 0,
            transform: "perspective(1000px) rotateX(-15deg)",
            transition: baseTransition,
          };
        default:
          return {};
      }
    }

    // Entering state - animate in
    if (animationPhase === "entering") {
      switch (transition) {
        case "fade":
          return {
            opacity: 1,
            transition: baseTransition,
          };
        case "slide":
          return {
            opacity: 1,
            transform: "translateY(0)",
            transition: baseTransition,
          };
        case "zoom":
          return {
            opacity: 1,
            transform: "scale(1)",
            transition: baseTransition,
          };
        case "flip":
          return {
            opacity: 1,
            transform: "perspective(1000px) rotateX(0)",
            transition: baseTransition,
          };
        default:
          return {};
      }
    }

    return {};
  };

  // Get initial styles for entering phase (before animation starts)
  const getEnteringInitialStyles = (): React.CSSProperties => {
    const transition = theme.animations.transition;

    if (transition === "none" || animationPhase !== "entering") {
      return {};
    }

    switch (transition) {
      case "fade":
        return { opacity: 0 };
      case "slide":
        const enterOffset = animationDirection === "next" ? "50vh" : "-50vh";
        return { opacity: 0, transform: `translateY(${enterOffset})` };
      case "zoom":
        return { opacity: 0, transform: "scale(1.2)" };
      case "flip":
        return { opacity: 0, transform: "perspective(1000px) rotateX(15deg)" };
      default:
        return {};
    }
  };

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isContentBlock = (type: string) => CONTENT_BLOCK_TYPES.includes(type);

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    if (isContentBlock(currentQuestion.type)) return true;
    if (!currentQuestion.required) return true;

    const value = answers[currentQuestion.id];
    if (value === null || value === undefined || value === "") {
      toast.error("This question is required");
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      toast.error("Please select at least one option");
      return false;
    }
    return true;
  };

  const animationDuration = ANIMATION_SPEED_MAP[theme.animations.speed];
  const totalStaggerElements = 3; // title, input, navigation
  const staggerDelay = 100; // matches getStaggeredAnimationStyles
  const totalExitDuration = animationDuration + (totalStaggerElements - 1) * staggerDelay;

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    if (animationPhase !== "idle") return; // Prevent double-click during animation
    
    if (currentIndex < contentQuestions.length - 1) {
      setAnimationDirection("next");
      
      // Phase 1: Exit animation
      setAnimationPhase("exiting");
      
      setTimeout(() => {
        // Change question
        setCurrentIndex(currentIndex + 1);
        
        // Phase 2: Enter animation
        setAnimationPhase("entering");
        
        setTimeout(() => {
          // Animation complete
          setAnimationPhase("idle");
        }, totalExitDuration);
      }, totalExitDuration);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && animationPhase === "idle") {
      setAnimationDirection("prev");
      
      // Phase 1: Exit animation
      setAnimationPhase("exiting");
      
      setTimeout(() => {
        // Change question
        setCurrentIndex(currentIndex - 1);
        
        // Phase 2: Enter animation
        setAnimationPhase("entering");
        
        setTimeout(() => {
          // Animation complete
          setAnimationPhase("idle");
        }, totalExitDuration);
      }, totalExitDuration);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers)
        .filter(
          ([_, value]) => value !== null && value !== undefined && value !== ""
        )
        .map(([questionId, value]) => {
          const question = contentQuestions.find((q) => q.id === questionId);
          if (!question) return null;

          const answer: Record<string, unknown> = { questionId };

          if (typeof value === "boolean") {
            answer.booleanValue = value;
          } else if (typeof value === "number") {
            answer.numberValue = value;
          } else if (Array.isArray(value)) {
            answer.jsonValue = value;
          } else if (typeof value === "object" && value !== null) {
            answer.jsonValue = value;
          } else if (question.type === "date") {
            answer.dateValue = value;
          } else {
            answer.textValue = String(value);
          }

          return answer;
        })
        .filter(Boolean);

      const response = await fetch(`/api/public/forms/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit");
      }

      setIsComplete(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit response"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show thank you screen after completion
  if (isComplete) {
    if (thankYouScreen) {
      const ThankYouRenderer = ContentBlockRenderers["thank_you_screen"];
      if (ThankYouRenderer) {
        return (
          <div
            className="relative flex min-h-screen items-center justify-center p-4"
            style={themeStyles}
          >
            {renderBackgroundImage()}
            {renderBranding()}
            <div className="relative z-10 w-full max-w-2xl">
              <ThankYouRenderer question={toDBQuestion(thankYouScreen)} />
            </div>
          </div>
        );
      }
    }

    // Fallback thank you screen
    return (
      <div
        className="relative flex min-h-screen items-center justify-center p-4"
        style={themeStyles}
      >
        {renderBackgroundImage()}
        {renderBranding()}
        <div className="relative z-10 w-full max-w-xl space-y-4 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Thank you!</h1>
          <p className="text-lg opacity-80">Your response has been recorded.</p>
        </div>
      </div>
    );
  }

  // Helper function to render background image with overlay
  function renderBackgroundImage() {
    if (!backgroundImageStyles) return null;
    return (
      <>
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{
            backgroundImage: backgroundImageStyles.backgroundImage,
            backgroundSize: backgroundImageStyles.backgroundSize,
            backgroundPosition: backgroundImageStyles.backgroundPosition,
          }}
          aria-hidden="true"
        />
        {backgroundImageStyles.overlay && (
          <div
            className="fixed inset-0"
            style={{ backgroundColor: backgroundImageStyles.overlay }}
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  // Helper function to render branding (logo)
  function renderBranding() {
    if (!theme.branding.logo) return null;
    return (
      <div
        className={cn(
          "fixed z-50 p-4",
          theme.branding.logoPosition === "top-left" && "top-0 left-0",
          theme.branding.logoPosition === "top-center" &&
            "top-0 left-1/2 -translate-x-1/2",
          theme.branding.logoPosition === "top-right" && "top-0 right-0",
          theme.branding.logoPosition === "bottom-left" && "bottom-0 left-0",
          theme.branding.logoPosition === "bottom-center" &&
            "bottom-0 left-1/2 -translate-x-1/2",
          theme.branding.logoPosition === "bottom-right" && "right-0 bottom-0"
        )}
      >
        <img
          src={theme.branding.logo}
          alt="Logo"
          className="h-8 w-auto object-contain"
        />
      </div>
    );
  }

  // Helper function to render powered by badge
  function renderPoweredBy() {
    if (theme.branding.hidePoweredBy) return null;
    return (
      <div className="fixed right-4 bottom-4 z-40">
        <span className="text-xs opacity-50" style={{ color: textColor }}>
          Powered by FormBuilder
        </span>
      </div>
    );
  }

  // Show welcome screen at start
  if (!hasStarted && welcomeScreen) {
    const WelcomeRenderer = ContentBlockRenderers["welcome_screen"];
    if (WelcomeRenderer) {
      return (
        <div
          className="relative flex min-h-screen items-center justify-center"
          style={themeStyles}
        >
          {renderBackgroundImage()}
          {renderBranding()}
          <div className="relative z-10 w-full max-w-2xl">
            <WelcomeRenderer
              question={toDBQuestion(welcomeScreen)}
              onContinue={() => setHasStarted(true)}
            />
          </div>
        </div>
      );
    }
  }

  // Render single question (one per page mode)
  if (oneQuestionPerPage && currentQuestion) {
    const isContentBlockType = isContentBlock(currentQuestion.type);
    const isLastQuestion = currentIndex === contentQuestions.length - 1;

    return (
      <div
        className="relative flex min-h-screen flex-col"
        style={themeStyles}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isSubmitting && animationPhase === "idle") {
            e.preventDefault();
            handleNext();
          }
        }}
        tabIndex={0}
      >
        {renderBackgroundImage()}
        {renderBranding()}
        {renderPoweredBy()}

        {/* Progress bar */}
        {form.settings?.showProgressBar &&
          theme.progressBar.type !== "none" && (
            <div
              className={cn(
                "h-1 w-full bg-gray-200/30",
                theme.progressBar.position === "bottom" &&
                  "fixed right-0 bottom-0 left-0"
              )}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: theme.progressBar.color || primaryColor,
                }}
              />
            </div>
          )}

        {/* Question content */}
        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-2xl space-y-8">
            {/* Question header - stagger index 0 */}
            <div className="space-y-2" style={getStaggeredAnimationStyles(0)}>
              <div className="flex items-start gap-3">
                {form.settings?.showQuestionNumbers && (
                  <>
                    {/* Question number badge style (Typeform style) */}
                    {theme.formElements.questionNumberStyle === "badge" && (
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {currentIndex + 1}
                      </span>
                    )}
                    {/* Question number circle style */}
                    {theme.formElements.questionNumberStyle === "circle" && (
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-medium"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                      >
                        {currentIndex + 1}
                      </span>
                    )}
                    {/* Question number arrow style (original) */}
                    {theme.formElements.questionNumberStyle === "arrow" && (
                      <span
                        className="text-lg font-medium"
                        style={{ color: primaryColor }}
                      >
                        {currentIndex + 1}
                        <span className="text-muted-foreground ml-1">→</span>
                      </span>
                    )}
                    {/* Question number plain style */}
                    {theme.formElements.questionNumberStyle === "plain" && (
                      <span
                        className="text-lg font-medium"
                        style={{ color: primaryColor }}
                      >
                        {currentIndex + 1}.
                      </span>
                    )}
                  </>
                )}
                <div className="flex-1">
                  <h2
                    className="text-2xl leading-tight font-bold sm:text-3xl"
                    style={{
                      fontFamily: `"${theme.typography.headingFontFamily}", system-ui, sans-serif`,
                    }}
                  >
                    {currentQuestion.title}
                    {currentQuestion.required && !isContentBlockType && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </h2>
                  {currentQuestion.description && (
                    <p className="text-muted-foreground mt-2 text-lg">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Question image */}
              {currentQuestion.image && (
                <div className="mt-4 overflow-hidden rounded-lg">
                  <img
                    src={currentQuestion.image}
                    alt=""
                    className="h-auto max-h-64 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Question input - stagger index 1 */}
            <div className="py-4" style={getStaggeredAnimationStyles(1)}>
              {renderQuestionInput(
                currentQuestion,
                answers[currentQuestion.id],
                (value) => setAnswer(currentQuestion.id, value),
                handleNext,
                theme.formElements.inputStyle
              )}
            </div>

            {/* Navigation - stagger index 2 */}
            {theme.formElements.navigationStyle === "inline" && (
              <div className="flex items-center justify-between pt-4" style={getStaggeredAnimationStyles(2)}>
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    size="lg"
                    style={{ backgroundColor: primaryColor }}
                    className="gap-2 px-6 text-white hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isLastQuestion ? (
                      "Submit"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    press{" "}
                    <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">
                      Enter ↵
                    </kbd>
                  </span>
                </div>
              </div>
            )}

            {/* Typeform-style navigation: OK button + corner arrows */}
            {theme.formElements.navigationStyle === "corner-arrows" && (
              <div className="pt-4" style={getStaggeredAnimationStyles(2)}>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  size="sm"
                  style={{ backgroundColor: primaryColor }}
                  className="px-4 text-white hover:opacity-90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    theme.buttons.submitText || (isLastQuestion ? "Submit" : "OK")
                  )}
                </Button>
              </div>
            )}

            {/* Bottom bar navigation */}
            {theme.formElements.navigationStyle === "bottom-bar" && (
              <div className="flex items-center justify-center gap-4 pt-4" style={getStaggeredAnimationStyles(2)}>
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  size="sm"
                  style={{ backgroundColor: primaryColor }}
                  className="px-6 text-white hover:opacity-90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLastQuestion ? (
                    "Submit"
                  ) : (
                    "Next"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={isLastQuestion || isSubmitting}
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Corner navigation arrows (Typeform style) */}
        {theme.formElements.navigationStyle === "corner-arrows" && (
          <div className="fixed right-4 bottom-4 z-20 flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="h-10 w-10 bg-white/80 backdrop-blur-sm"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleNext}
              disabled={isLastQuestion && isSubmitting}
              style={{ backgroundColor: primaryColor }}
              className="h-10 w-10 text-white"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // All questions view (non one-per-page mode)
  return (
    <div className="relative min-h-screen p-4 sm:p-8" style={themeStyles}>
      {renderBackgroundImage()}
      {renderBranding()}
      {renderPoweredBy()}
      <div className="relative z-10 mx-auto max-w-2xl space-y-8">
        {/* Form header */}
        <div className="space-y-2 text-center">
          <h1
            className="text-3xl font-bold"
            style={{
              fontFamily: `"${theme.typography.headingFontFamily}", system-ui, sans-serif`,
            }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        {/* All questions */}
        {contentQuestions.map((question, index) => {
          const isContentBlockType = isContentBlock(question.type);

          return (
            <div key={question.id} className="space-y-4 rounded-lg border p-6">
              <div className="space-y-1">
                {form.settings?.showQuestionNumbers && (
                  <span className="text-muted-foreground text-sm font-medium">
                    Question {index + 1}
                  </span>
                )}
                <h3
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: `"${theme.typography.headingFontFamily}", system-ui, sans-serif`,
                  }}
                >
                  {question.title}
                  {question.required && !isContentBlockType && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </h3>
                {question.description && (
                  <p className="text-muted-foreground">
                    {question.description}
                  </p>
                )}
              </div>

              {question.image && (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={question.image}
                    alt=""
                    className="h-auto max-h-48 w-full object-cover"
                  />
                </div>
              )}

              <div>
                {renderQuestionInput(
                  question, 
                  answers[question.id], 
                  (value) => setAnswer(question.id, value),
                  undefined,
                  theme.formElements.inputStyle
                )}
              </div>
            </div>
          );
        })}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          style={{ backgroundColor: primaryColor }}
          className="w-full text-white hover:opacity-90"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Submit
        </Button>
      </div>
    </div>
  );
}

// Render question input using the appropriate renderer
function renderQuestionInput(
  question: Question,
  value: AnswerValue,
  onChange: (value: AnswerValue) => void,
  onContinue?: () => void,
  inputStyle: "box" | "underline" | "borderless" = "underline"
) {
  const dbQuestion = toDBQuestion(question);
  const type = question.type;

  // Check if it's a content block
  const ContentRenderer = ContentBlockRenderers[type];
  if (ContentRenderer) {
    return <ContentRenderer question={dbQuestion} onContinue={onContinue} />;
  }

  // Check if it's a regular question
  const QuestionRenderer = QuestionRenderers[type];
  if (QuestionRenderer) {
    // Type-safe wrapper for onChange
    const handleChange = (newValue: unknown) => {
      onChange(newValue as AnswerValue);
    };

    return (
      <QuestionRenderer
        question={dbQuestion}
        value={value}
        onChange={handleChange}
        autoFocus
        inputStyle={inputStyle}
      />
    );
  }

  // Fallback for unsupported types
  return (
    <div className="border-muted-foreground/50 text-muted-foreground rounded-lg border border-dashed p-4 text-center">
      <p>Question type &quot;{type}&quot; is not yet supported.</p>
    </div>
  );
}
