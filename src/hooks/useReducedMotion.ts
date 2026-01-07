"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the user prefers reduced motion
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <motion.div
 *     initial={prefersReducedMotion ? false : { opacity: 0 }}
 *     animate={{ opacity: 1 }}
 *     transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
 *   >
 *     Content
 *   </motion.div>
 * );
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation duration based on user preference
 *
 * @example
 * const getDuration = useAnimationDuration();
 *
 * return (
 *   <motion.div
 *     transition={{ duration: getDuration(0.3) }}
 *   >
 *     Content
 *   </motion.div>
 * );
 */
export function useAnimationDuration() {
  const prefersReducedMotion = useReducedMotion();

  return (normalDuration: number): number => {
    return prefersReducedMotion ? 0 : normalDuration;
  };
}

/**
 * Safe animation configuration that respects user preferences
 */
export function useSafeAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return {
    shouldAnimate: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : undefined,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : undefined,
    initial: prefersReducedMotion ? false : undefined,
  };
}
