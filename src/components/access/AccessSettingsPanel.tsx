"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarClock,
  Key,
  Loader2,
  Lock,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Schema for access settings form
const accessSettingsSchema = z.object({
  isPublic: z.boolean(),
  passwordProtection: z.object({
    enabled: z.boolean(),
    password: z.string().optional(),
    message: z.string().optional(),
  }),
  responseLimit: z.object({
    enabled: z.boolean(),
    maxResponses: z.number().min(1).optional(),
    closedMessage: z.string().optional(),
    showRemaining: z.boolean().optional(),
  }),
  schedule: z.object({
    enabled: z.boolean(),
    openAt: z.string().optional(),
    closeAt: z.string().optional(),
    beforeOpenMessage: z.string().optional(),
    afterCloseMessage: z.string().optional(),
  }),
  singleResponse: z.object({
    enabled: z.boolean(),
    method: z.enum(["cookie", "ip", "email", "user"]),
    allowEdit: z.boolean().optional(),
  }),
});

type AccessSettingsFormValues = z.infer<typeof accessSettingsSchema>;

async function fetchAccessSettings(formId: string) {
  const response = await fetch(`/api/forms/${formId}/access`);
  if (!response.ok) throw new Error("Failed to fetch settings");
  return response.json();
}

async function updateAccessSettings(
  formId: string,
  settings: Record<string, unknown>
) {
  const response = await fetch(`/api/forms/${formId}/access`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Failed to update settings");
  return response.json();
}

export function AccessSettingsPanel({ formId }: { formId: string }) {
  const queryClient = useQueryClient();
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["access-settings", formId],
    queryFn: () => fetchAccessSettings(formId),
  });

  const form = useForm<AccessSettingsFormValues>({
    resolver: zodResolver(accessSettingsSchema),
    defaultValues: {
      isPublic: true,
      passwordProtection: { enabled: false },
      responseLimit: { enabled: false, showRemaining: false },
      schedule: { enabled: false },
      singleResponse: { enabled: false, method: "cookie" },
    },
    values: data?.settings
      ? {
          isPublic: data.settings.isPublic ?? true,
          passwordProtection: {
            enabled: data.settings.passwordProtection?.enabled ?? false,
            message: data.settings.passwordProtection?.message ?? "",
          },
          responseLimit: {
            enabled: !!data.settings.responseLimit?.maxResponses,
            maxResponses: data.settings.responseLimit?.maxResponses ?? 100,
            closedMessage: data.settings.responseLimit?.closedMessage ?? "",
            showRemaining: data.settings.responseLimit?.showRemaining ?? false,
          },
          schedule: {
            enabled:
              !!data.settings.schedule?.openAt ||
              !!data.settings.schedule?.closeAt,
            openAt: data.settings.schedule?.openAt ?? "",
            closeAt: data.settings.schedule?.closeAt ?? "",
            beforeOpenMessage: data.settings.schedule?.beforeOpenMessage ?? "",
            afterCloseMessage: data.settings.schedule?.afterCloseMessage ?? "",
          },
          singleResponse: {
            enabled: data.settings.singleResponse?.enabled ?? false,
            method: data.settings.singleResponse?.method ?? "cookie",
            allowEdit: data.settings.singleResponse?.allowEdit ?? false,
          },
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (values: AccessSettingsFormValues) => {
      const settings: Record<string, unknown> = {
        isPublic: values.isPublic,
      };

      if (values.passwordProtection.enabled) {
        settings.passwordProtection = {
          enabled: true,
          password: values.passwordProtection.password,
          message: values.passwordProtection.message,
        };
      }

      if (values.responseLimit.enabled && values.responseLimit.maxResponses) {
        settings.responseLimit = {
          maxResponses: values.responseLimit.maxResponses,
          closedMessage: values.responseLimit.closedMessage,
          showRemaining: values.responseLimit.showRemaining,
        };
      }

      if (values.schedule.enabled) {
        settings.schedule = {
          openAt: values.schedule.openAt || undefined,
          closeAt: values.schedule.closeAt || undefined,
          beforeOpenMessage: values.schedule.beforeOpenMessage,
          afterCloseMessage: values.schedule.afterCloseMessage,
        };
      }

      if (values.singleResponse.enabled) {
        settings.singleResponse = {
          enabled: true,
          method: values.singleResponse.method,
          allowEdit: values.singleResponse.allowEdit,
        };
      }

      return updateAccessSettings(formId, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-settings", formId] });
      toast.success("Access settings updated");
      setShowPasswordChange(false);
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const onSubmit = (values: AccessSettingsFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Protection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Password Protection</CardTitle>
                <CardDescription>
                  Require a password to access this form
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="passwordProtection.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Enable password protection</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("passwordProtection.enabled") && (
              <>
                {data?.settings?.passwordProtection?.hasPassword && !showPasswordChange ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">Password is set</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordChange(true)}
                    >
                      Change password
                    </Button>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="passwordProtection.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="passwordProtection.message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom message (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Message shown on password screen"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Response Limit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Response Limit</CardTitle>
                <CardDescription>
                  Automatically close form after a set number of responses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="responseLimit.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Enable response limit</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("responseLimit.enabled") && (
              <>
                <FormField
                  control={form.control}
                  name="responseLimit.maxResponses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum responses</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseLimit.showRemaining"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Show remaining spots</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseLimit.closedMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closed message (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Message shown when limit is reached"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Single Response */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">One Response Per Person</CardTitle>
                <CardDescription>
                  Prevent multiple submissions from the same person
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="singleResponse.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Enable single response</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("singleResponse.enabled") && (
              <>
                <FormField
                  control={form.control}
                  name="singleResponse.method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detection method</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cookie">Browser cookie</SelectItem>
                          <SelectItem value="ip">IP address</SelectItem>
                          <SelectItem value="email">Email address</SelectItem>
                          <SelectItem value="user">Logged in user</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How to identify returning respondents
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="singleResponse.allowEdit"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Allow editing existing response</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Schedule</CardTitle>
                <CardDescription>
                  Set when the form opens and closes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="schedule.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Enable scheduling</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("schedule.enabled") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="schedule.openAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opens at</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schedule.closeAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closes at</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="schedule.beforeOpenMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Before open message (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Message shown before form opens"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule.afterCloseMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>After close message (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Message shown after form closes"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
