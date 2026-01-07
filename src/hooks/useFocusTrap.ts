"use client";

import { useCallback, useRef, useEffect } from "react";

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
].join(", ");

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   */
  enabled?: boolean;
  /**
   * Selector for the element to focus initially
   */
  initialFocus?: string;
  /**
   * Whether to return focus to the previously focused element when disabled
   */
  returnFocus?: boolean;
}

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and dropdown menus
 *
 * @example
 * function Modal({ isOpen, onClose, children }) {
 *   const trapRef = useFocusTrap({ enabled: isOpen, returnFocus: true });
 *
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       {children}
 *     </div>
 *   );
 * }
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, initialFocus, returnFocus = true } = options;

  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    ).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }, []);

  // Handle Tab key to trap focus
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: going backwards
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: going forwards
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, getFocusableElements]
  );

  // Store previous focus and set initial focus
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set initial focus
    const focusableElements = getFocusableElements();

    if (initialFocus) {
      const initialElement =
        containerRef.current.querySelector<HTMLElement>(initialFocus);
      if (initialElement) {
        initialElement.focus();
      } else if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Return focus when disabled
    return () => {
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [enabled, initialFocus, returnFocus, getFocusableElements]);

  // Add event listener for Tab key
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return containerRef;
}

/**
 * Utility function to get the first focusable element in a container
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(FOCUSABLE_ELEMENTS);
}

/**
 * Utility function to get the last focusable element in a container
 */
export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
  return elements[elements.length - 1] ?? null;
}

/**
 * Utility function to check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  return element.matches(FOCUSABLE_ELEMENTS);
}
