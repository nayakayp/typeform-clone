"use client";

import { useCallback, useMemo, useRef } from "react";

type EventType =
  | "view"
  | "start"
  | "complete"
  | "drop_off"
  | "question_view"
  | "question_answer";

type DeviceType = "desktop" | "mobile" | "tablet";

interface TrackingMetadata {
  visitorId: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}

interface TrackEventPayload {
  sessionId: string;
  eventType: EventType;
  visitorId?: string;
  questionId?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  timeSpent?: number;
}

const VISITOR_ID_KEY = "typeform_visitor_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof window === "undefined") return generateUUID();

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function detectDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();

  // Check for tablets first (they often contain mobile keywords too)
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    return "tablet";
  }

  // Check for mobile devices
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/i.test(
      ua
    )
  ) {
    return "mobile";
  }

  // Check for Android without "mobile" (usually tablets)
  if (/android/i.test(ua) && !/mobile/i.test(ua)) {
    return "tablet";
  }

  return "desktop";
}

function detectBrowser(userAgent: string): string {
  const ua = userAgent;

  // Order matters - check more specific browsers first
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/MSIE|Trident/i.test(ua)) return "Internet Explorer";

  return "Unknown";
}

function detectOS(userAgent: string): string {
  const ua = userAgent;

  if (/Windows/i.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  if (/CrOS/i.test(ua)) return "ChromeOS";

  return "Unknown";
}

function parseUTMParams(): {
  source?: string;
  medium?: string;
  campaign?: string;
} {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const result: { source?: string; medium?: string; campaign?: string } = {};

  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");

  if (source) result.source = source;
  if (medium) result.medium = medium;
  if (campaign) result.campaign = campaign;

  return result;
}

function getReferrer(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.referrer || undefined;
}

export function useAnalyticsTracking(formId: string) {
  // Generate session ID once on mount
  const sessionIdRef = useRef<string>(generateUUID());

  // Compute metadata once on mount
  const metadata = useMemo<TrackingMetadata>(() => {
    if (typeof window === "undefined") {
      return {
        visitorId: generateUUID(),
        deviceType: "desktop",
        browser: "Unknown",
        os: "Unknown",
      };
    }

    const userAgent = navigator.userAgent;
    const utmParams = parseUTMParams();
    const referrer = getReferrer();

    return {
      visitorId: getVisitorId(),
      deviceType: detectDeviceType(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      ...utmParams,
      ...(referrer && { referrer }),
    };
  }, []);

  const apiUrl = `/api/forms/${formId}/analytics/track`;

  const sendEvent = useCallback(
    async (
      eventType: EventType,
      additionalData?: { questionId?: string; timeSpent?: number }
    ) => {
      const payload: TrackEventPayload = {
        sessionId: sessionIdRef.current,
        eventType,
        visitorId: metadata.visitorId,
        deviceType: metadata.deviceType,
        browser: metadata.browser,
        os: metadata.os,
        source: metadata.source,
        medium: metadata.medium,
        campaign: metadata.campaign,
        referrer: metadata.referrer,
        ...additionalData,
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error(
            `Analytics tracking failed: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    },
    [apiUrl, metadata]
  );

  const trackView = useCallback(() => {
    sendEvent("view");
  }, [sendEvent]);

  const trackStart = useCallback(() => {
    sendEvent("start");
  }, [sendEvent]);

  const trackQuestionView = useCallback(
    (questionId: string) => {
      sendEvent("question_view", { questionId });
    },
    [sendEvent]
  );

  const trackQuestionAnswer = useCallback(
    (questionId: string, timeSpent: number) => {
      sendEvent("question_answer", { questionId, timeSpent });
    },
    [sendEvent]
  );

  const trackComplete = useCallback(
    (totalTime: number) => {
      sendEvent("complete", { timeSpent: totalTime });
    },
    [sendEvent]
  );

  const trackDropOff = useCallback(
    (lastQuestionId?: string) => {
      const payload: TrackEventPayload = {
        sessionId: sessionIdRef.current,
        eventType: "drop_off",
        visitorId: metadata.visitorId,
        deviceType: metadata.deviceType,
        browser: metadata.browser,
        os: metadata.os,
        source: metadata.source,
        medium: metadata.medium,
        campaign: metadata.campaign,
        referrer: metadata.referrer,
        ...(lastQuestionId && { questionId: lastQuestionId }),
      };

      // Use sendBeacon for drop-off events (works during page unload)
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        const success = navigator.sendBeacon(apiUrl, blob);
        if (!success) {
          console.error("Analytics: sendBeacon failed for drop_off event");
        }
      } else {
        // Fallback to fetch for browsers without sendBeacon support
        sendEvent("drop_off", { questionId: lastQuestionId });
      }
    },
    [apiUrl, metadata, sendEvent]
  );

  return {
    trackView,
    trackStart,
    trackQuestionView,
    trackQuestionAnswer,
    trackComplete,
    trackDropOff,
  };
}
