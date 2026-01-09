"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Form, Question } from "@/types";
import type { Theme } from "@/lib/theme/types";
import type { AnswersMap, AnswerValue } from "@/lib/form-taking/types";
import { DEFAULT_THEME } from "@/lib/theme/defaults";
import { FONT_SIZE_MAP, LINE_HEIGHT_MAP } from "@/lib/theme/types";
import { useFormTaking } from "@/hooks/useFormTaking";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import { FormProgressBar } from "./FormProgressBar";
import { FormNavigation } from "./FormNavigation";
import { QuestionDisplay } from "./QuestionDisplay";
import { FormWelcomeScreen } from "./FormWelcomeScreen";
import { FormThankYouScreen } from "./FormThankYouScreen";
import { estimateCompletionTime } from "@/lib/form-taking/utils";
import type {
  WelcomeScreenSettings,
  ThankYouScreenSettings,
} from "@/components/questions/types";

export interface FormTakingContainerProps {
  form: Form;
  questions: Question[];
  theme?: Theme;
  onSubmit?: (answers: AnswersMap) => Promise<string | void>;
  className?: string;
}

/**
 * FormTakingContainer - Main container for form taking experience
 * Orchestrates all form taking components and state
 */
export function FormTakingContainer({
  form,
  questions,
  theme: customTheme,
  onSubmit,
  className,
}: FormTakingContainerProps) {
  // Merge custom theme with defaults
  const theme = useMemo(() => {
    return {
      ...DEFAULT_THEME,
      ...customTheme,
      colors: { ...DEFAULT_THEME.colors, ...customTheme?.colors },
      background: { ...DEFAULT_THEME.background, ...customTheme?.background },
      typography: { ...DEFAULT_THEME.typography, ...customTheme?.typography },
      layout: { ...DEFAULT_THEME.layout, ...customTheme?.layout },
      buttons: { ...DEFAULT_THEME.buttons, ...customTheme?.buttons },
      progressBar: {
        ...DEFAULT_THEME.progressBar,
        ...customTheme?.progressBar,
      },
      branding: { ...DEFAULT_THEME.branding, ...customTheme?.branding },
      animations: { ...DEFAULT_THEME.animations, ...customTheme?.animations },
    };
  }, [customTheme]);

  // Form taking state
  const {
    state,
    currentQuestion,
    currentQuestionNumber,
    totalQuestions,
    startForm: originalStartForm,
    goNext,
    goPrevious,
    setAnswer: originalSetAnswer,
    submitForm: originalSubmitForm,
    canGoBack,
    canGoNext,
    isLastQuestion,
    isWelcomeScreen,
    isThankYouScreen,
    currentAnswer,
    currentError,
  } = useFormTaking({
    form,
    questions,
    theme,
    onSubmit,
  });

  // Analytics tracking
  const {
    trackView,
    trackStart,
    trackQuestionView,
    trackQuestionAnswer,
    trackComplete,
    trackDropOff,
  } = useAnalyticsTracking(form.id);

  // Track question start time for calculating time spent
  const questionStartTimeRef = useRef<number>(Date.now());
  const previousQuestionIdRef = useRef<string | null>(null);

  // Track view on mount
  useEffect(() => {
    trackView();
  }, [trackView]);

  // Track question views when currentIndex changes
  useEffect(() => {
    if (currentQuestion && state.isStarted && !state.isSubmitted) {
      // Track answer for previous question if exists
      if (
        previousQuestionIdRef.current &&
        previousQuestionIdRef.current !== currentQuestion.id
      ) {
        const timeSpent = Math.round(
          (Date.now() - questionStartTimeRef.current) / 1000
        );
        trackQuestionAnswer(previousQuestionIdRef.current, timeSpent);
      }

      // Track view for new question
      trackQuestionView(currentQuestion.id);

      // Reset timer for new question
      questionStartTimeRef.current = Date.now();
      previousQuestionIdRef.current = currentQuestion.id;
    }
  }, [
    currentQuestion,
    state.isStarted,
    state.isSubmitted,
    trackQuestionView,
    trackQuestionAnswer,
  ]);

  // Track drop-off on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only track drop-off if form is started but not submitted
      if (state.isStarted && !state.isSubmitted) {
        trackDropOff(currentQuestion?.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state.isStarted, state.isSubmitted, currentQuestion?.id, trackDropOff]);

  // Wrap startForm to include analytics
  const startForm = useCallback(() => {
    trackStart();
    originalStartForm();
  }, [trackStart, originalStartForm]);

  // Wrap setAnswer to track question answers
  const setAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      originalSetAnswer(questionId, value);
    },
    [originalSetAnswer]
  );

  // Wrap submitForm to include analytics
  const submitForm = useCallback(async () => {
    // Track final question answer
    if (currentQuestion && previousQuestionIdRef.current) {
      const timeSpent = Math.round(
        (Date.now() - questionStartTimeRef.current) / 1000
      );
      trackQuestionAnswer(previousQuestionIdRef.current, timeSpent);
    }

    // Calculate total time
    const totalTime = state.startTime
      ? Math.round((Date.now() - state.startTime.getTime()) / 1000)
      : 0;

    await originalSubmitForm();

    // Track completion after successful submit
    if (!state.submitError) {
      trackComplete(totalTime);
    }
  }, [
    currentQuestion,
    state.startTime,
    state.submitError,
    originalSubmitForm,
    trackQuestionAnswer,
    trackComplete,
  ]);

  // Handle option selection from keyboard
  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion) return;

      const settings = currentQuestion.settings as {
        options?: Array<{ id: string }>;
      };
      const options = settings?.options || [];

      if (optionIndex >= 0 && optionIndex < options.length) {
        const option = options[optionIndex];

        // For checkboxes, toggle the option
        if (currentQuestion.type === "checkboxes") {
          const currentValue = (currentAnswer as string[]) || [];
          const newValue = currentValue.includes(option.id)
            ? currentValue.filter((id) => id !== option.id)
            : [...currentValue, option.id];
          setAnswer(currentQuestion.id, newValue);
        } else {
          // For single selection, just set the value
          setAnswer(currentQuestion.id, option.id);
        }
      }
    },
    [currentQuestion, currentAnswer, setAnswer]
  );

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: goNext,
    onPrevious: goPrevious,
    onSubmit: isLastQuestion ? submitForm : undefined,
    onSelectOption: handleSelectOption,
    currentQuestion,
    currentAnswer,
    setAnswer: (value: AnswerValue) =>
      currentQuestion && setAnswer(currentQuestion.id, value),
    enabled: !isWelcomeScreen && !isThankYouScreen && !state.isSubmitting,
    isLastQuestion,
    isSubmitting: state.isSubmitting,
  });

  // Build theme styles
  const themeStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      "--primary": theme.colors.primary,
      "--foreground": theme.colors.foreground,
      "--background": theme.colors.background,
      "--muted": theme.colors.muted,
      "--muted-foreground": theme.colors.mutedForeground,
      fontFamily: theme.typography.fontFamily,
      fontSize: FONT_SIZE_MAP[theme.typography.fontSize].base,
      lineHeight: LINE_HEIGHT_MAP[theme.typography.lineHeight],
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
    }

    return styles;
  }, [theme]);

  // Background image styles
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

  // Estimated time for welcome screen
  const estimatedMinutes = useMemo(() => {
    return estimateCompletionTime(questions);
  }, [questions]);

  // Welcome screen settings
  const welcomeSettings = useMemo(() => {
    const welcomeQuestion = questions.find((q) => q.type === "welcome_screen");
    if (!welcomeQuestion) return null;
    return welcomeQuestion.settings as WelcomeScreenSettings;
  }, [questions]);

  // Thank you screen settings
  const thankYouSettings = useMemo(() => {
    const thankYouQuestion = questions.find(
      (q) => q.type === "thank_you_screen"
    );
    if (!thankYouQuestion) return null;
    return thankYouQuestion.settings as ThankYouScreenSettings;
  }, [questions]);

  // Determine what to show
  const showWelcome = isWelcomeScreen && !state.isStarted;
  const showThankYou = state.isSubmitted || isThankYouScreen;
  const showProgressBar =
    !showWelcome &&
    !showThankYou &&
    theme.progressBar.type !== "none" &&
    form.settings?.showProgressBar !== false;

  return (
    <div
      className={cn("relative min-h-screen w-full", className)}
      style={themeStyles}
    >
      {/* Background image with overlay */}
      {backgroundImageStyles && (
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
      )}

      {/* Logo */}
      {theme.branding.logo && (
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
      )}

      {/* Progress bar */}
      {showProgressBar && (
        <FormProgressBar
          current={currentQuestionNumber}
          total={totalQuestions}
          type={theme.progressBar.type}
          position={theme.progressBar.position}
          showPercentage={theme.progressBar.showPercentage}
          color={theme.progressBar.color || theme.colors.primary}
        />
      )}

      {/* Main content */}
      <main className="relative z-10">
        {/* Welcome screen */}
        {showWelcome && (
          <FormWelcomeScreen
            title={welcomeSettings?.title || form.title || "Welcome"}
            description={welcomeSettings?.description || form.description}
            buttonText={welcomeSettings?.buttonText}
            image={welcomeSettings?.image}
            video={welcomeSettings?.video}
            estimatedMinutes={
              welcomeSettings?.estimatedMinutes || estimatedMinutes
            }
            showEstimatedTime={welcomeSettings?.showEstimatedTime}
            onStart={startForm}
          />
        )}

        {/* Thank you screen */}
        {showThankYou && (
          <FormThankYouScreen
            title={thankYouSettings?.title}
            description={thankYouSettings?.description}
            showSocialShare={thankYouSettings?.showSocialShare}
            socialMessage={thankYouSettings?.socialMessage}
            redirectUrl={thankYouSettings?.redirectUrl}
            redirectDelay={thankYouSettings?.redirectDelay}
            buttonText={thankYouSettings?.buttonText}
            buttonUrl={thankYouSettings?.buttonUrl}
            showConfetti={thankYouSettings?.showConfetti}
          />
        )}

        {/* Question display */}
        {!showWelcome && !showThankYou && currentQuestion && (
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionNumber}
            totalQuestions={totalQuestions}
            value={currentAnswer}
            error={currentError}
            direction={state.direction}
            onChange={(value) => setAnswer(currentQuestion.id, value)}
            onContinue={goNext}
            disabled={state.isSubmitting}
            showQuestionNumber={form.settings?.showQuestionNumbers !== false}
          />
        )}
      </main>

      {/* Navigation */}
      {!showWelcome && !showThankYou && (
        <FormNavigation
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          isLastQuestion={isLastQuestion}
          isSubmitting={state.isSubmitting}
          onBack={goPrevious}
          onNext={goNext}
          onSubmit={submitForm}
          showKeyboardHints
        />
      )}

      {/* Powered by branding */}
      {!theme.branding.hidePoweredBy && (
        <div className="fixed bottom-4 left-4 z-40">
          <span className="text-muted-foreground text-xs opacity-50">
            Powered by FormBuilder
          </span>
        </div>
      )}
    </div>
  );
}
