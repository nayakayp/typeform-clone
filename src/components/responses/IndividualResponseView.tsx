"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MapPin,
  Monitor,
  Globe,
  Mail,
  User,
  Calendar,
} from "lucide-react";
import type {
  ResponseWithAnswers,
  ResponseStatus,
} from "@/lib/responses/types";
import {
  formatResponseStatus,
  getStatusVariant,
  formatResponseDate,
  formatDuration,
  calculateResponseDuration,
  getRespondentIdentifier,
  getLocationString,
  getAnswerValue,
  getAnswerValueType,
  formatAnswerValue,
} from "@/lib/responses/utils";
import { getQuestionTypeLabel } from "@/lib/question-types";

interface IndividualResponseViewProps {
  response: ResponseWithAnswers;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  currentIndex?: number;
  totalCount?: number;
}

export function IndividualResponseView({
  response,
  onClose,
  onNavigate,
  currentIndex,
  totalCount,
}: IndividualResponseViewProps) {
  const duration = calculateResponseDuration(
    response.startedAt,
    response.completedAt
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {getRespondentIdentifier(response.email, response.respondentId)}
            </h2>
            <p className="text-muted-foreground text-sm">
              {response.form?.title || "Response Details"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentIndex !== undefined && totalCount !== undefined && (
            <span className="text-muted-foreground text-sm">
              {currentIndex + 1} of {totalCount}
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {/* Status and Metadata */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Response Information
                </CardTitle>
                <Badge
                  variant={getStatusVariant(response.status as ResponseStatus)}
                >
                  {formatResponseStatus(response.status as ResponseStatus)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Started</p>
                    <p className="text-muted-foreground text-sm">
                      {formatResponseDate(response.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-muted-foreground text-sm">
                      {response.completedAt
                        ? formatResponseDate(response.completedAt)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDuration(duration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Device</p>
                    <p className="text-muted-foreground text-sm">
                      {response.device || "Unknown"} -{" "}
                      {response.browser || "Unknown"} on{" "}
                      {response.os || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-muted-foreground text-sm">
                      {getLocationString(response.city, response.country)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">IP Address</p>
                    <p className="text-muted-foreground text-sm">
                      {response.ipAddress || "Unknown"}
                    </p>
                  </div>
                </div>
                {response.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-muted-foreground text-sm">
                        {response.email}
                      </p>
                    </div>
                  </div>
                )}
                {response.respondentId && (
                  <div className="flex items-center gap-3">
                    <User className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Respondent ID</p>
                      <p className="text-muted-foreground text-sm">
                        {response.respondentId}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* UTM Parameters */}
              {(response.utmSource ||
                response.utmMedium ||
                response.utmCampaign) && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="mb-2 text-sm font-medium">UTM Parameters</p>
                    <div className="flex flex-wrap gap-2">
                      {response.utmSource && (
                        <Badge variant="outline">
                          Source: {response.utmSource}
                        </Badge>
                      )}
                      {response.utmMedium && (
                        <Badge variant="outline">
                          Medium: {response.utmMedium}
                        </Badge>
                      )}
                      {response.utmCampaign && (
                        <Badge variant="outline">
                          Campaign: {response.utmCampaign}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Answers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Answers ({response.answers?.length || 0})
              </CardTitle>
              <CardDescription>
                All responses submitted for this form
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response.answers && response.answers.length > 0 ? (
                <div className="space-y-4">
                  {response.answers.map((answer, index) => {
                    const valueType = getAnswerValueType(answer);
                    const value = getAnswerValue(answer);
                    const displayValue = formatAnswerValue(value, valueType);
                    const questionTitle =
                      answer.question?.title || `Question ${index + 1}`;
                    const questionType = answer.question?.type || "unknown";

                    return (
                      <div key={answer.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-medium">{questionTitle}</p>
                            <p className="text-muted-foreground text-xs">
                              {getQuestionTypeLabel(questionType)}
                            </p>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {formatResponseDate(answer.createdAt)}
                          </span>
                        </div>
                        <div className="bg-muted mt-2 rounded-md p-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {displayValue}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No answers recorded
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
