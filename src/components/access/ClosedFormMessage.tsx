"use client";

import { useState, useEffect } from "react";
import { Clock, XCircle, UserCheck } from "lucide-react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClosedFormMessageProps {
  reason:
    | "not_published"
    | "not_open_yet"
    | "closed"
    | "max_responses"
    | "already_responded"
    | "ip_blocked"
    | "invalid_link"
    | "link_expired"
    | "link_used";
  message?: string;
  opensAt?: string;
  allowEdit?: boolean;
  existingResponseId?: string;
  onEditClick?: () => void;
}

function CountdownTimer({ target }: { target: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(target);
      const now = new Date();
      const diff = differenceInSeconds(targetDate, now);

      if (diff <= 0) {
        setTimeLeft("Opening now...");
        // Reload the page after a brief delay
        setTimeout(() => window.location.reload(), 2000);
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return <span className="font-mono text-2xl font-bold">{timeLeft}</span>;
}

export function ClosedFormMessage({
  reason,
  message,
  opensAt,
  allowEdit,
  onEditClick,
}: ClosedFormMessageProps) {
  const getIcon = () => {
    switch (reason) {
      case "not_open_yet":
        return <Clock className="h-12 w-12 text-muted-foreground" />;
      case "already_responded":
        return <UserCheck className="h-12 w-12 text-green-500" />;
      default:
        return <XCircle className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (reason) {
      case "not_published":
        return "This form is not available";
      case "not_open_yet":
        return "This form is not open yet";
      case "closed":
        return "This form is no longer accepting responses";
      case "max_responses":
        return "This form has reached its response limit";
      case "already_responded":
        return "You have already submitted a response";
      case "ip_blocked":
        return "Access denied";
      case "invalid_link":
        return "Invalid access link";
      case "link_expired":
        return "This link has expired";
      case "link_used":
        return "This link has already been used";
      default:
        return "This form is not available";
    }
  };

  const getDefaultMessage = () => {
    switch (reason) {
      case "already_responded":
        return "You can only submit one response to this form.";
      case "ip_blocked":
        return "Your access to this form has been restricted.";
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">{getIcon()}</div>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason === "not_open_yet" && opensAt && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Opens in</p>
              <CountdownTimer target={opensAt} />
            </div>
          )}

          {(message || getDefaultMessage()) && (
            <p className="text-muted-foreground">
              {message || getDefaultMessage()}
            </p>
          )}

          {reason === "already_responded" && allowEdit && onEditClick && (
            <Button onClick={onEditClick} className="mt-4">
              Edit your response
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
