"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Clock,
  MapPin,
  Monitor,
  Mail,
} from "lucide-react";
import type { ResponseCardData, ResponseStatus } from "@/lib/responses/types";
import {
  formatResponseStatus,
  getStatusVariant,
  formatDuration,
  formatRelativeTime,
  getLocationString,
  getRespondentIdentifier,
} from "@/lib/responses/utils";

interface ResponseCardProps {
  response: ResponseCardData;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function ResponseCard({
  response,
  onView,
  onDelete,
  isSelected,
  onSelect,
}: ResponseCardProps) {
  const statusVariant = getStatusVariant(response.status as ResponseStatus);

  return (
    <Card
      className={`hover:border-primary/50 cursor-pointer transition-colors ${
        isSelected ? "border-primary ring-primary/20 ring-2" : ""
      }`}
      onClick={() => onSelect?.(response.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">
              {getRespondentIdentifier(response.email, response.respondentId)}
            </CardTitle>
            <CardDescription className="mt-1">
              {response.formTitle || "Untitled Form"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant}>
              {formatResponseStatus(response.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(response.id);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(response.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(response.startedAt)}</span>
          </div>
          {response.completionTime !== null &&
            response.completionTime !== undefined && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(response.completionTime)}</span>
              </div>
            )}
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>
              {response.metadata.device || "Unknown"} -{" "}
              {response.metadata.browser || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {getLocationString(
                response.metadata.city,
                response.metadata.country
              )}
            </span>
          </div>
          {response.email && (
            <div className="col-span-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{response.email}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground text-sm">
            {response.answersCount} answer
            {response.answersCount !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(response.id);
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
