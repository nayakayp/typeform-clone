"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { useUser } from "@/hooks/useUser";

export function NotificationPreferences() {
  const { user, updateNotifications, updatePreferences, isLoading } = useUser();
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const handleNotificationToggle = async (
    key:
      | "emailNotifications"
      | "formResponses"
      | "weeklyDigest"
      | "marketingEmails",
    value: boolean
  ) => {
    setIsSaving(key);
    try {
      await updateNotifications({ [key]: value });
      toast.success("Notification preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(null);
    }
  };

  const handleFrequencyChange = async (value: string) => {
    setIsSaving("frequency");
    try {
      await updatePreferences({
        emailFrequency: value as "realtime" | "daily" | "weekly" | "never",
      });
      toast.success("Email frequency updated");
    } catch {
      toast.error("Failed to update email frequency");
    } finally {
      setIsSaving(null);
    }
  };

  if (!user) {
    return null;
  }

  const notifications = user.settings.notifications;
  const preferences = user.settings.preferences;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Control how and when you receive notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-muted-foreground text-sm">
                Receive email notifications about your account activity
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving === "emailNotifications" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                id="emailNotifications"
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("emailNotifications", checked)
                }
                disabled={isLoading || isSaving !== null}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="formResponses">Form Responses</Label>
              <p className="text-muted-foreground text-sm">
                Get notified when someone submits a response to your forms
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving === "formResponses" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                id="formResponses"
                checked={notifications.formResponses}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("formResponses", checked)
                }
                disabled={
                  isLoading ||
                  isSaving !== null ||
                  !notifications.emailNotifications
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyDigest">Weekly Digest</Label>
              <p className="text-muted-foreground text-sm">
                Receive a weekly summary of your form activity
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving === "weeklyDigest" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                id="weeklyDigest"
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("weeklyDigest", checked)
                }
                disabled={
                  isLoading ||
                  isSaving !== null ||
                  !notifications.emailNotifications
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-muted-foreground text-sm">
                Receive updates about new features and promotions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving === "marketingEmails" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                id="marketingEmails"
                checked={notifications.marketingEmails}
                onCheckedChange={(checked) =>
                  handleNotificationToggle("marketingEmails", checked)
                }
                disabled={isLoading || isSaving !== null}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailFrequency">Notification Frequency</Label>
              <p className="text-muted-foreground text-sm">
                How often should we send you email updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving === "frequency" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Select
                value={preferences.emailFrequency}
                onValueChange={handleFrequencyChange}
                disabled={
                  isLoading ||
                  isSaving !== null ||
                  !notifications.emailNotifications
                }
              >
                <SelectTrigger id="emailFrequency" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
