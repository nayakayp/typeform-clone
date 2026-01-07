"use client";

/**
 * useTheme Hook
 * Custom hook for accessing and modifying theme in forms
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  Theme,
  ThemeUpdate,
  ThemeColors,
  ThemeBackground,
  ThemeTypography,
  ThemeLayout,
  ThemeButtons,
  ThemeProgressBar,
  ThemeBranding,
  ThemeAnimations,
  ThemeTemplate,
} from "@/lib/theme/types";
import {
  DEFAULT_THEME,
  mergeThemes,
  preloadThemeFonts,
  applyThemeToElement,
  removeThemeFromElement,
  serializeTheme,
  deserializeTheme,
  THEME_TEMPLATES,
} from "@/lib/theme";

// ============================================
// Types
// ============================================

interface UseThemeOptions {
  initialTheme?: Theme;
  storageKey?: string;
  autoSave?: boolean;
  onThemeChange?: (theme: Theme) => void;
}

interface UseThemeReturn {
  // Current theme
  theme: Theme;

  // Full theme operations
  setTheme: (theme: Theme) => void;
  updateTheme: (updates: ThemeUpdate) => void;
  resetTheme: () => void;

  // Section-specific updates
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateBackground: (background: Partial<ThemeBackground>) => void;
  updateTypography: (typography: Partial<ThemeTypography>) => void;
  updateLayout: (layout: Partial<ThemeLayout>) => void;
  updateButtons: (buttons: Partial<ThemeButtons>) => void;
  updateProgressBar: (progressBar: Partial<ThemeProgressBar>) => void;
  updateBranding: (branding: Partial<ThemeBranding>) => void;
  updateAnimations: (animations: Partial<ThemeAnimations>) => void;

  // Template operations
  applyTemplate: (templateId: string) => void;
  getAvailableTemplates: () => ThemeTemplate[];

  // DOM operations
  applyToElement: (element: HTMLElement | null) => void;
  removeFromElement: (element: HTMLElement | null) => void;

  // Serialization
  exportTheme: () => string;
  importTheme: (json: string) => boolean;

  // State
  isDirty: boolean;
  hasChanges: boolean;
}

// ============================================
// Hook Implementation
// ============================================

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const {
    initialTheme = DEFAULT_THEME,
    storageKey,
    autoSave = false,
    onThemeChange,
  } = options;

  // Load initial theme from storage if available
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined" && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = deserializeTheme(stored);
        if (parsed) return parsed;
      }
    }
    return initialTheme;
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [originalTheme] = useState<Theme>(initialTheme);
  const [isDirty, setIsDirty] = useState(false);

  // Check if theme has changes from original
  const hasChanges = useMemo(() => {
    return serializeTheme(theme) !== serializeTheme(originalTheme);
  }, [theme, originalTheme]);

  // Auto-save to storage
  useEffect(() => {
    if (autoSave && storageKey && typeof window !== "undefined") {
      localStorage.setItem(storageKey, serializeTheme(theme));
    }
  }, [theme, autoSave, storageKey]);

  // Preload fonts when typography changes
  useEffect(() => {
    preloadThemeFonts(theme);
  }, [theme]);

  // ============================================
  // Full Theme Operations
  // ============================================

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      setIsDirty(true);
      onThemeChange?.(newTheme);
    },
    [onThemeChange]
  );

  const updateTheme = useCallback(
    (updates: ThemeUpdate) => {
      setThemeState((current) => {
        const merged = mergeThemes(current, updates);
        onThemeChange?.(merged);
        return merged;
      });
      setIsDirty(true);
    },
    [onThemeChange]
  );

  const resetTheme = useCallback(() => {
    setThemeState(initialTheme);
    setIsDirty(false);
    onThemeChange?.(initialTheme);
  }, [initialTheme, onThemeChange]);

  // ============================================
  // Section-specific Updates
  // ============================================

  const updateColors = useCallback(
    (colors: Partial<ThemeColors>) => {
      updateTheme({ colors: { ...theme.colors, ...colors } });
    },
    [updateTheme, theme.colors]
  );

  const updateBackground = useCallback(
    (background: Partial<ThemeBackground>) => {
      updateTheme({
        background: { ...theme.background, ...background } as ThemeBackground,
      });
    },
    [updateTheme, theme.background]
  );

  const updateTypography = useCallback(
    (typography: Partial<ThemeTypography>) => {
      updateTheme({ typography: { ...theme.typography, ...typography } });
    },
    [updateTheme, theme.typography]
  );

  const updateLayout = useCallback(
    (layout: Partial<ThemeLayout>) => {
      updateTheme({ layout: { ...theme.layout, ...layout } });
    },
    [updateTheme, theme.layout]
  );

  const updateButtons = useCallback(
    (buttons: Partial<ThemeButtons>) => {
      updateTheme({ buttons: { ...theme.buttons, ...buttons } });
    },
    [updateTheme, theme.buttons]
  );

  const updateProgressBar = useCallback(
    (progressBar: Partial<ThemeProgressBar>) => {
      updateTheme({ progressBar: { ...theme.progressBar, ...progressBar } });
    },
    [updateTheme, theme.progressBar]
  );

  const updateBranding = useCallback(
    (branding: Partial<ThemeBranding>) => {
      updateTheme({ branding: { ...theme.branding, ...branding } });
    },
    [updateTheme, theme.branding]
  );

  const updateAnimations = useCallback(
    (animations: Partial<ThemeAnimations>) => {
      updateTheme({ animations: { ...theme.animations, ...animations } });
    },
    [updateTheme, theme.animations]
  );

  // ============================================
  // Template Operations
  // ============================================

  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = THEME_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        const newTheme: Theme = {
          ...template.theme,
          id: theme.id,
          name: template.name,
          description: template.description,
        };
        setTheme(newTheme);
      }
    },
    [setTheme, theme.id]
  );

  const getAvailableTemplates = useCallback(() => {
    return THEME_TEMPLATES;
  }, []);

  // ============================================
  // DOM Operations
  // ============================================

  const applyToElement = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        applyThemeToElement(element, theme);
      }
    },
    [theme]
  );

  const removeFromElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      removeThemeFromElement(element);
    }
  }, []);

  // ============================================
  // Serialization
  // ============================================

  const exportTheme = useCallback(() => {
    return serializeTheme(theme);
  }, [theme]);

  const importTheme = useCallback(
    (json: string): boolean => {
      const parsed = deserializeTheme(json);
      if (parsed) {
        setTheme(parsed);
        return true;
      }
      return false;
    },
    [setTheme]
  );

  // ============================================
  // Return
  // ============================================

  return {
    theme,
    setTheme,
    updateTheme,
    resetTheme,
    updateColors,
    updateBackground,
    updateTypography,
    updateLayout,
    updateButtons,
    updateProgressBar,
    updateBranding,
    updateAnimations,
    applyTemplate,
    getAvailableTemplates,
    applyToElement,
    removeFromElement,
    exportTheme,
    importTheme,
    isDirty,
    hasChanges,
  };
}

export default useTheme;
