"use client";

import { useCallback, useRef } from "react";

type AriaLive = "polite" | "assertive" | "off";

/**
 * Hook to announce messages to screen readers
 *
 * @example
 * const announce = useAnnounce();
 * announce('Form saved successfully');
 * announce('Error: Please fill all required fields', 'assertive');
 */
export function useAnnounce() {
  const regionRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback(
    (message: string, priority: AriaLive = "polite") => {
      // Create or get the live region
      if (!regionRef.current) {
        const region = document.createElement("div");
        region.setAttribute("role", "status");
        region.setAttribute("aria-live", priority);
        region.setAttribute("aria-atomic", "true");
        region.className = "sr-only";
        region.style.cssText = `
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        `;
        document.body.appendChild(region);
        regionRef.current = region;
      }

      // Update priority if different
      regionRef.current.setAttribute("aria-live", priority);

      // Clear and set message (to trigger announcement)
      regionRef.current.textContent = "";

      // Use setTimeout to ensure the DOM update triggers the announcement
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    },
    []
  );

  return announce;
}

/**
 * Hook for immediate announcements (clears after delay)
 */
export function useAnnounceOnce() {
  const announce = useCallback(
    (message: string, priority: AriaLive = "polite", duration = 1000) => {
      const region = document.createElement("div");
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", priority);
      region.setAttribute("aria-atomic", "true");
      region.className = "sr-only";
      region.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      region.textContent = message;
      document.body.appendChild(region);

      setTimeout(() => {
        region.remove();
      }, duration);
    },
    []
  );

  return announce;
}
