"use client";

import { useState, useCallback } from "react";
import type {
  UserWithSettings,
  UserSettings,
  UserProfile,
  NotificationSettings,
  UserPreferences,
  ActiveSession,
  SecuritySettings,
} from "@/lib/user/types";

// Mock user data
const mockUser: UserWithSettings = {
  id: "user_1",
  email: "john.doe@example.com",
  name: "John Doe",
  avatar: null,
  timezone: "America/New_York",
  language: "en",
  createdAt: new Date("2024-01-15"),
  settings: {
    notifications: {
      emailNotifications: true,
      formResponses: true,
      weeklyDigest: false,
      marketingEmails: false,
    },
    preferences: {
      theme: "system",
      defaultLanguage: "en",
      emailFrequency: "daily",
    },
  },
};

// Mock active sessions
const mockSessions: ActiveSession[] = [
  {
    id: "session_1",
    device: "MacBook Pro",
    browser: "Chrome 120",
    location: "New York, US",
    lastActive: new Date(),
    isCurrent: true,
  },
  {
    id: "session_2",
    device: "iPhone 14",
    browser: "Safari 17",
    location: "New York, US",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isCurrent: false,
  },
  {
    id: "session_3",
    device: "Windows PC",
    browser: "Firefox 121",
    location: "Boston, US",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isCurrent: false,
  },
];

// Mock security settings
const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  activeSessions: mockSessions,
};

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
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<UserWithSettings | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettings>(mockSecuritySettings);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser((prev) => (prev ? { ...prev, ...profile } : null));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update profile")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (settings: Partial<UserSettings>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser((prev) =>
          prev
            ? {
                ...prev,
                settings: {
                  ...prev.settings,
                  ...settings,
                },
              }
            : null
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update settings")
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateNotifications = useCallback(
    async (notifications: Partial<NotificationSettings>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser((prev) =>
          prev
            ? {
                ...prev,
                settings: {
                  ...prev.settings,
                  notifications: {
                    ...prev.settings.notifications,
                    ...notifications,
                  },
                },
              }
            : null
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update notifications")
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser((prev) =>
          prev
            ? {
                ...prev,
                settings: {
                  ...prev.settings,
                  preferences: {
                    ...prev.settings.preferences,
                    ...preferences,
                  },
                },
              }
            : null
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update preferences")
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const toggleTwoFactor = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSecuritySettings((prev) => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to toggle 2FA"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSecuritySettings((prev) => ({
        ...prev,
        activeSessions: prev.activeSessions.filter((s) => s.id !== sessionId),
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to revoke session")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real implementation, this would redirect to login page
      setUser(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete account")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  };
}
