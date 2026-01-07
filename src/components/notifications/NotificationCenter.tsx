"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Users,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Notification type from API
interface Notification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

// API functions
async function fetchNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const response = await fetch("/api/notifications");
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

async function markAsRead(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to mark as read");
}

async function markAllAsRead(): Promise<void> {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to mark all as read");
}

// Get icon for notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case "new_response":
      return FileText;
    case "team_invite":
      return Users;
    case "form_published":
    case "form_closed":
      return FileText;
    case "webhook_failed":
    case "response_limit_warning":
      return AlertTriangle;
    case "mention":
    case "comment":
      return MessageSquare;
    default:
      return Bell;
  }
}

// Get color for notification type
function getNotificationColor(type: string, priority: string) {
  if (priority === "high") {
    return "text-red-500";
  }

  switch (type) {
    case "new_response":
      return "text-blue-500";
    case "team_invite":
      return "text-purple-500";
    case "form_published":
      return "text-green-500";
    case "webhook_failed":
    case "response_limit_warning":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
}

// Notification item component
function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(
    notification.type,
    notification.priority
  );

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted",
        !notification.read && "bg-muted/50"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <p
          className={cn(
            "text-sm leading-tight",
            !notification.read && "font-medium"
          )}
        >
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
}

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markReadMutation.mutate(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => {
              setOpen(false);
              window.location.href = "/settings/notifications";
            }}
          >
            <Settings className="mr-2 h-3 w-3" />
            Notification settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
