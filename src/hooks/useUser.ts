"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UserWithSettings,
  UserSettings,
  UserProfile,
  NotificationSettings,
  UserPreferences,
  ActiveSession,
  SecuritySettings,
} from "@/lib/user/types";

// API response types
interface ProfileResponse {
  profile: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    createdAt: string;
  };
}

interface NotificationsResponse {
  notifications: {
    newResponse: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
    formPublished: boolean;
    teamInvite: boolean;
    responseLimitWarning: boolean;
    formClosed: boolean;
    marketingEmails: boolean;
  };
}

interface PreferencesResponse {
  preferences: {
    theme: "light" | "dark" | "system";
    defaultLanguage: string;
    emailFrequency: "realtime" | "daily" | "weekly" | "never";
    timezone: string | null;
  };
}

interface SecurityResponse {
  sessions: {
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  twoFactorEnabled: boolean;
}

// Query keys
const QUERY_KEYS = {
  profile: ["settings", "profile"] as const,
  notifications: ["settings", "notifications"] as const,
  preferences: ["settings", "preferences"] as const,
  security: ["settings", "security"] as const,
};

// Fetch functions
async function fetchProfile(): Promise<ProfileResponse> {
  const res = await fetch("/api/settings/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/api/settings/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

async function fetchPreferences(): Promise<PreferencesResponse> {
  const res = await fetch("/api/settings/preferences");
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
}

async function fetchSecurity(): Promise<SecurityResponse> {
  const res = await fetch("/api/settings/security");
  if (!res.ok) throw new Error("Failed to fetch security settings");
  return res.json();
}

// Update functions
async function updateProfileApi(
  data: Partial<UserProfile>
): Promise<ProfileResponse> {
  const res = await fetch("/api/settings/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

async function updateNotificationsApi(
  data: Partial<NotificationSettings>
): Promise<NotificationsResponse> {
  // Map from frontend types to API types
  const apiData: Record<string, boolean> = {};
  if (data.emailNotifications !== undefined)
    apiData.newResponse = data.emailNotifications;
  if (data.formResponses !== undefined)
    apiData.newResponse = data.formResponses;
  if (data.weeklyDigest !== undefined) apiData.weeklyReport = data.weeklyDigest;
  if (data.marketingEmails !== undefined)
    apiData.marketingEmails = data.marketingEmails;

  const res = await fetch("/api/settings/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiData),
  });
  if (!res.ok) throw new Error("Failed to update notifications");
  return res.json();
}

async function updatePreferencesApi(
  data: Partial<UserPreferences>
): Promise<PreferencesResponse> {
  const res = await fetch("/api/settings/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update preferences");
  return res.json();
}

async function revokeSessionApi(sessionId: string): Promise<void> {
  const res = await fetch(`/api/settings/security?sessionId=${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to revoke session");
}

async function changePasswordApi(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch("/api/settings/security", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "change-password",
      currentPassword,
      newPassword,
    }),
  });
  if (!res.ok) throw new Error("Failed to change password");
}

interface UseUserReturn {
  user: UserWithSettings | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateNotifications: (
    notifications: Partial<NotificationSettings>
  ) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  securitySettings: SecuritySettings;
  toggleTwoFactor: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const queryClient = useQueryClient();

  // Fetch all data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: fetchNotifications,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: preferencesData,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useQuery({
    queryKey: QUERY_KEYS.preferences,
    queryFn: fetchPreferences,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: securityData,
    isLoading: securityLoading,
    error: securityError,
  } = useQuery({
    queryKey: QUERY_KEYS.security,
    queryFn: fetchSecurity,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const profileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: updateNotificationsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });

  const preferencesMutation = useMutation({
    mutationFn: updatePreferencesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.preferences });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: revokeSessionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.security });
    },
  });

  // Combine loading and error states
  const isLoading =
    profileLoading ||
    notificationsLoading ||
    preferencesLoading ||
    securityLoading;
  const error =
    profileError ||
    notificationsError ||
    preferencesError ||
    securityError ||
    null;

  // Build user object from fetched data
  const user: UserWithSettings | null =
    profileData && notificationsData && preferencesData
      ? {
          id: profileData.profile.id,
          email: profileData.profile.email,
          name: profileData.profile.name,
          avatar: profileData.profile.image,
          timezone: preferencesData.preferences.timezone || "UTC",
          language: preferencesData.preferences.defaultLanguage,
          createdAt: new Date(profileData.profile.createdAt),
          settings: {
            notifications: {
              emailNotifications: notificationsData.notifications.newResponse,
              formResponses: notificationsData.notifications.newResponse,
              weeklyDigest: notificationsData.notifications.weeklyReport,
              marketingEmails: notificationsData.notifications.marketingEmails,
            },
            preferences: {
              theme: preferencesData.preferences.theme,
              defaultLanguage: preferencesData.preferences.defaultLanguage,
              emailFrequency: preferencesData.preferences.emailFrequency,
            },
          },
        }
      : null;

  // Build security settings
  const securitySettings: SecuritySettings = {
    twoFactorEnabled: securityData?.twoFactorEnabled ?? false,
    activeSessions:
      securityData?.sessions.map(
        (s): ActiveSession => ({
          id: s.id,
          device: s.device,
          browser: s.browser,
          location: s.location,
          lastActive: new Date(s.lastActive),
          isCurrent: s.isCurrent,
        })
      ) ?? [],
  };

  // Action handlers
  const updateProfile = useCallback(
    async (profile: Partial<UserProfile>) => {
      await profileMutation.mutateAsync(profile);
    },
    [profileMutation]
  );

  const updateNotifications = useCallback(
    async (notifications: Partial<NotificationSettings>) => {
      await notificationsMutation.mutateAsync(notifications);
    },
    [notificationsMutation]
  );

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      await preferencesMutation.mutateAsync(preferences);
    },
    [preferencesMutation]
  );

  const updateSettings = useCallback(
    async (settings: Partial<UserSettings>) => {
      if (settings.notifications) {
        await updateNotifications(settings.notifications);
      }
      if (settings.preferences) {
        await updatePreferences(settings.preferences);
      }
    },
    [updateNotifications, updatePreferences]
  );

  const toggleTwoFactor = useCallback(async () => {
    // TODO: Implement 2FA toggle when backend supports it
    console.warn("2FA toggle not yet implemented");
  }, []);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      await revokeSessionMutation.mutateAsync(sessionId);
    },
    [revokeSessionMutation]
  );

  const deleteAccount = useCallback(async () => {
    // TODO: Implement account deletion API
    console.warn("Account deletion not yet implemented");
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await changePasswordApi(currentPassword, newPassword);
    },
    []
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.preferences }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.security }),
    ]);
  }, [queryClient]);

  return {
    user,
    isLoading,
    error,
    updateProfile,
    updateSettings,
    updateNotifications,
    updatePreferences,
    securitySettings,
    toggleTwoFactor,
    revokeSession,
    deleteAccount,
    changePassword,
    refetch,
  };
}
