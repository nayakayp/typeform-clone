// User profile types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  timezone: string;
  language: string;
  createdAt: Date;
}

// User preferences
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultLanguage: string;
  emailFrequency: "realtime" | "daily" | "weekly" | "never";
}

// Notification settings
export interface NotificationSettings {
  emailNotifications: boolean;
  formResponses: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

// Combined user settings
export interface UserSettings {
  notifications: NotificationSettings;
  preferences: UserPreferences;
}

// User with settings
export interface UserWithSettings extends UserProfile {
  settings: UserSettings;
}

// Active session for security settings
export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  activeSessions: ActiveSession[];
}

// Timezone option for selector
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

// Language option for selector
export interface LanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
}
