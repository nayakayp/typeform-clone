"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  Loader2,
  Shield,
  Smartphone,
  Monitor,
  Laptop,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { useUser } from "@/hooks/useUser";
import type { ActiveSession } from "@/lib/user/types";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

type DeviceType = "mobile" | "laptop" | "desktop";

function getDeviceType(device: string): DeviceType {
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes("iphone") || deviceLower.includes("android")) {
    return "mobile";
  }
  if (deviceLower.includes("macbook") || deviceLower.includes("laptop")) {
    return "laptop";
  }
  return "desktop";
}

function DeviceIcon({
  device,
  className,
}: {
  device: string;
  className?: string;
}) {
  const deviceType = getDeviceType(device);

  switch (deviceType) {
    case "mobile":
      return <Smartphone className={className} />;
    case "laptop":
      return <Laptop className={className} />;
    default:
      return <Monitor className={className} />;
  }
}

function SessionItem({
  session,
  onRevoke,
  isRevoking,
}: {
  session: ActiveSession;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
          <DeviceIcon device={session.device} className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{session.device}</p>
            {session.isCurrent && (
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {session.browser} - {session.location}
          </p>
          <p className="text-muted-foreground text-xs">
            {session.isCurrent
              ? "Active now"
              : `Last active ${formatDistanceToNow(session.lastActive, { addSuffix: true })}`}
          </p>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
        >
          {isRevoking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="sr-only">Revoke session</span>
        </Button>
      )}
    </div>
  );
}

export function SecuritySettings() {
  const { securitySettings, toggleTwoFactor, revokeSession, isLoading } =
    useUser();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isTogglingTwoFactor, setIsTogglingTwoFactor] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Password change data:", data);
      toast.success("Password changed successfully");
      reset();
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    setIsTogglingTwoFactor(true);
    try {
      await toggleTwoFactor();
      toast.success(
        securitySettings.twoFactorEnabled
          ? "Two-factor authentication disabled"
          : "Two-factor authentication enabled"
      );
    } catch {
      toast.error("Failed to update two-factor authentication");
    } finally {
      setIsTogglingTwoFactor(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await revokeSession(sessionId);
      toast.success("Session revoked successfully");
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingSessionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your password, two-factor authentication, and active sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
                disabled={isChangingPassword}
              />
              {errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                disabled={isChangingPassword}
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={isChangingPassword}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-muted-foreground text-sm">
                  {securitySettings.twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Enable 2FA for additional security"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTogglingTwoFactor && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={handleToggleTwoFactor}
                disabled={isLoading || isTogglingTwoFactor}
              />
            </div>
          </div>

          {securitySettings.twoFactorEnabled && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Recovery Codes</p>
                <p className="text-muted-foreground text-sm">
                  Recovery codes can be used to access your account if you lose
                  access to your authentication device.
                </p>
                <Button variant="outline" size="sm">
                  View Recovery Codes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions and sign out from other devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {securitySettings.activeSessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onRevoke={handleRevokeSession}
              isRevoking={revokingSessionId === session.id}
            />
          ))}

          {securitySettings.activeSessions.filter((s) => !s.isCurrent).length >
            0 && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  securitySettings.activeSessions
                    .filter((s) => !s.isCurrent)
                    .forEach((s) => handleRevokeSession(s.id));
                }}
              >
                Sign Out All Other Sessions
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
