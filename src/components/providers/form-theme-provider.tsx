"use client";

/**
 * Form Theme Provider
 * Provides theme context for form rendering with dynamic CSS variable application
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from "react";
import type { Theme, ThemeUpdate } from "@/lib/theme/types";
import {
  DEFAULT_THEME,
  applyThemeToElement,
  removeThemeFromElement,
  preloadThemeFonts,
  mergeThemes,
} from "@/lib/theme";

// ============================================
// Context Types
// ============================================

interface FormThemeContextValue {
  // Current theme
  theme: Theme;

  // Theme manipulation
  setTheme: (theme: Theme) => void;
  updateTheme: (updates: ThemeUpdate) => void;
  resetTheme: () => void;

  // Theme application
  applyToElement: (element: HTMLElement | null) => void;

  // State
  isLoading: boolean;
}

// ============================================
// Context
// ============================================

const FormThemeContext = createContext<FormThemeContextValue | null>(null);

// ============================================
// Provider Props
// ============================================

interface FormThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  autoApply?: boolean;
  targetSelector?: string;
}

// ============================================
// Provider Component
// ============================================

export function FormThemeProvider({
  children,
  initialTheme,
  onThemeChange,
  autoApply = true,
  targetSelector,
}: FormThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme || DEFAULT_THEME);
  const [isLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load fonts when theme typography changes
  useEffect(() => {
    preloadThemeFonts(theme);
  }, [theme]);

  // Apply theme to target element
  useEffect(() => {
    if (!autoApply) return;

    const target = targetSelector
      ? document.querySelector<HTMLElement>(targetSelector)
      : containerRef.current;

    if (target) {
      applyThemeToElement(target, theme);
    }

    return () => {
      if (target) {
        removeThemeFromElement(target);
      }
    };
  }, [theme, autoApply, targetSelector]);

  // Set complete theme
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      onThemeChange?.(newTheme);
    },
    [onThemeChange]
  );

  // Update partial theme
  const updateTheme = useCallback(
    (updates: ThemeUpdate) => {
      setThemeState((current) => {
        const merged = mergeThemes(current, updates);
        onThemeChange?.(merged);
        return merged;
      });
    },
    [onThemeChange]
  );

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(initialTheme || DEFAULT_THEME);
  }, [initialTheme, setTheme]);

  // Apply theme to specific element
  const applyToElement = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        applyThemeToElement(element, theme);
      }
    },
    [theme]
  );

  // Memoized context value
  const value = useMemo<FormThemeContextValue>(
    () => ({
      theme,
      setTheme,
      updateTheme,
      resetTheme,
      applyToElement,
      isLoading,
    }),
    [theme, setTheme, updateTheme, resetTheme, applyToElement, isLoading]
  );

  return (
    <FormThemeContext.Provider value={value}>
      <div
        ref={containerRef}
        className="form-theme-container"
        style={{
          fontFamily: `var(--theme-font-family, ${theme.typography.fontFamily})`,
        }}
      >
        {children}
      </div>
    </FormThemeContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useFormTheme(): FormThemeContextValue {
  const context = useContext(FormThemeContext);

  if (!context) {
    throw new Error("useFormTheme must be used within a FormThemeProvider");
  }

  return context;
}

// ============================================
// Optional Hook (doesn't throw)
// ============================================

export function useFormThemeOptional(): FormThemeContextValue | null {
  return useContext(FormThemeContext);
}

// ============================================
// Export Context for advanced usage
// ============================================

export { FormThemeContext };
