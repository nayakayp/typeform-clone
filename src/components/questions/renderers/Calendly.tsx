"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "../types";

interface CalendlySettings {
  calendlyUrl?: string;
  hideEventDetails?: boolean;
  hideLandingPageDetails?: boolean;
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
}

interface CalendlyValue {
  scheduled: boolean;
  eventUri?: string;
  inviteeUri?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  inviteeName?: string;
  inviteeEmail?: string;
}

export function Calendly({
  question,
  value,
  onChange,
  disabled,
  error,
}: QuestionRendererProps<CalendlyValue | null>) {
  const settings = (question.settings || {}) as CalendlySettings;
  const [isEmbedded, setIsEmbedded] = useState(false);

  const calendlyUrl = settings.calendlyUrl || "";

  // Listen for Calendly events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.event === "calendly.event_scheduled") {
        const payload = event.data.payload;
        onChange({
          scheduled: true,
          eventUri: payload.event?.uri,
          inviteeUri: payload.invitee?.uri,
          eventStartTime: payload.event?.start_time,
          eventEndTime: payload.event?.end_time,
          inviteeName: payload.invitee?.name,
          inviteeEmail: payload.invitee?.email,
        });
        setIsEmbedded(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onChange]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  if (value?.scheduled) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-start gap-4">
          <CheckCircle className="h-8 w-8 flex-shrink-0 text-green-600 dark:text-green-400" />
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Meeting Scheduled!
            </h3>
            {value.eventStartTime && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(value.eventStartTime)}</span>
              </div>
            )}
            {value.inviteeName && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Booked by: {value.inviteeName}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!calendlyUrl) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/50 p-8 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">
          Calendly URL not configured
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Please set up a Calendly URL in the question settings
        </p>
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border">
          <iframe
            src={calendlyUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            className="absolute inset-0"
            title="Calendly Scheduling"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEmbedded(false)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <Calendar className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 text-lg font-semibold">Schedule a Meeting</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a time that works best for you
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => setIsEmbedded(true)}
            disabled={disabled}
            className="gap-2"
            size="lg"
          >
            <Clock className="h-4 w-4" />
            Choose a Time
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(calendlyUrl, "_blank")}
            disabled={disabled}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
    </div>
  );
}
