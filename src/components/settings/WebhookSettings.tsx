"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Webhook,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string | null;
  createdAt: string;
  lastTriggeredAt: string | null;
}

interface WebhookLog {
  id: string;
  event: string;
  responseStatus: number | null;
  error: string | null;
  createdAt: string;
}

// Available webhook events
const WEBHOOK_EVENTS = [
  { value: "response.created", label: "Response Created", description: "When a new response is submitted" },
  { value: "response.completed", label: "Response Completed", description: "When a response is fully completed" },
  { value: "form.published", label: "Form Published", description: "When a form is published" },
  { value: "form.closed", label: "Form Closed", description: "When a form is closed" },
] as const;

// Form schema
const webhookFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
  secret: z.string().optional(),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

// API functions
async function fetchWebhooks(formId: string): Promise<WebhookData[]> {
  const response = await fetch(`/api/forms/${formId}/webhooks`);
  if (!response.ok) throw new Error("Failed to fetch webhooks");
  const data = await response.json();
  return data.webhooks;
}

async function createWebhook(formId: string, data: WebhookFormValues): Promise<WebhookData> {
  const response = await fetch(`/api/forms/${formId}/webhooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create webhook");
  }
  return response.json();
}

async function updateWebhook(
  webhookId: string,
  data: Partial<WebhookFormValues & { isActive: boolean }>
): Promise<WebhookData> {
  const response = await fetch(`/api/webhooks/${webhookId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update webhook");
  }
  return response.json();
}

async function deleteWebhook(webhookId: string): Promise<void> {
  const response = await fetch(`/api/webhooks/${webhookId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete webhook");
}

async function testWebhook(webhookId: string): Promise<{ success: boolean; status: number; error?: string }> {
  const response = await fetch(`/api/webhooks/${webhookId}/test`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to test webhook");
  return response.json();
}

async function fetchWebhookLogs(webhookId: string): Promise<WebhookLog[]> {
  const response = await fetch(`/api/webhooks/${webhookId}/logs`);
  if (!response.ok) throw new Error("Failed to fetch webhook logs");
  const data = await response.json();
  return data.logs;
}

// Webhook form component
function WebhookForm({
  formId,
  webhook,
  onSuccess,
  onCancel,
}: {
  formId: string;
  webhook?: WebhookData;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: webhook?.name || "",
      url: webhook?.url || "",
      events: webhook?.events || [],
      secret: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: WebhookFormValues) => createWebhook(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", formId] });
      toast.success("Webhook created successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: WebhookFormValues) => updateWebhook(webhook!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", formId] });
      toast.success("Webhook updated successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: WebhookFormValues) => {
    if (webhook) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Webhook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/webhook" {...field} />
              </FormControl>
              <FormDescription>
                The endpoint that will receive webhook payloads
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="events"
          render={() => (
            <FormItem>
              <FormLabel>Events</FormLabel>
              <FormDescription>
                Select which events should trigger this webhook
              </FormDescription>
              <div className="space-y-2 mt-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <FormField
                    key={event.value}
                    control={form.control}
                    name="events"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(event.value)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value || []), event.value]
                                : field.value?.filter((v) => v !== event.value) || [];
                              field.onChange(newValue);
                            }}
                          />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="font-normal cursor-pointer">
                            {event.label}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {event.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={webhook ? "Leave blank to keep current" : "Enter a secret key"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Used to sign webhook payloads for verification
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {webhook ? "Update" : "Create"} Webhook
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Webhook logs dialog
function WebhookLogsDialog({
  webhook,
  open,
  onOpenChange,
}: {
  webhook: WebhookData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["webhook-logs", webhook.id],
    queryFn: () => fetchWebhookLogs(webhook.id),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery Logs</DialogTitle>
          <DialogDescription>
            Recent webhook deliveries for {webhook.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Webhook className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No delivery logs yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    {log.responseStatus && log.responseStatus >= 200 && log.responseStatus < 300 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{log.event}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.responseStatus ? (
                      <Badge
                        variant={log.responseStatus >= 200 && log.responseStatus < 300 ? "default" : "destructive"}
                      >
                        {log.responseStatus}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                    {log.error && (
                      <p className="mt-1 text-xs text-red-500 max-w-[200px] truncate">
                        {log.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Webhook item component
function WebhookItem({
  webhook,
  formId,
}: {
  webhook: WebhookData;
  formId: string;
}) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: () => updateWebhook(webhook.id, { isActive: !webhook.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", formId] });
      toast.success(webhook.isActive ? "Webhook paused" : "Webhook activated");
    },
    onError: () => {
      toast.error("Failed to update webhook");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWebhook(webhook.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", formId] });
      toast.success("Webhook deleted");
    },
    onError: () => {
      toast.error("Failed to delete webhook");
    },
  });

  const testMutation = useMutation({
    mutationFn: () => testWebhook(webhook.id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Test successful (${result.status})`);
      } else {
        toast.error(`Test failed: ${result.error || "Unknown error"}`);
      }
      queryClient.invalidateQueries({ queryKey: ["webhook-logs", webhook.id] });
    },
    onError: () => {
      toast.error("Failed to test webhook");
    },
  });

  const copyUrl = () => {
    navigator.clipboard.writeText(webhook.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 rounded-full p-2",
                  webhook.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                )}
              >
                <Webhook className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{webhook.name}</h4>
                  {!webhook.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Paused
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="max-w-[300px] truncate">{webhook.url}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyUrl}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
                {webhook.lastTriggeredAt && (
                  <p className="text-xs text-muted-foreground">
                    Last triggered{" "}
                    {formatDistanceToNow(new Date(webhook.lastTriggeredAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => testMutation.mutate()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Send Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLogsOpen(true)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleMutation.mutate()}>
                  {webhook.isActive ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>
              Update webhook configuration
            </DialogDescription>
          </DialogHeader>
          <WebhookForm
            formId={formId}
            webhook={webhook}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <WebhookLogsDialog
        webhook={webhook}
        open={logsOpen}
        onOpenChange={setLogsOpen}
      />
    </>
  );
}

// Main component
export function WebhookSettings({ formId }: { formId: string }) {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks", formId],
    queryFn: () => fetchWebhooks(formId),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Send real-time notifications to external services when events occur
            </CardDescription>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
                <DialogDescription>
                  Configure a new webhook endpoint
                </DialogDescription>
              </DialogHeader>
              <WebhookForm
                formId={formId}
                onSuccess={() => setCreateOpen(false)}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !webhooks || webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Webhook className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No webhooks configured</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a webhook to receive real-time notifications
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <WebhookItem key={webhook.id} webhook={webhook} formId={formId} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
