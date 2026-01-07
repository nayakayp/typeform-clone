import type { UserProfile, TimezoneOption, LanguageOption } from "./types";

/**
 * Format user display name from profile
 */
export function formatUserDisplayName(user: UserProfile | null): string {
  if (!user) return "Anonymous";
  if (user.name) return user.name;
  // Extract name from email (before @)
  return user.email.split("@")[0];
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: UserProfile | null): string {
  if (!user) return "?";

  if (user.name) {
    const nameParts = user.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }

  // Use email prefix
  return user.email.slice(0, 2).toUpperCase();
}

/**
 * Common timezone options
 */
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "UTC", label: "UTC", offset: "+00:00" },
  {
    value: "America/New_York",
    label: "Eastern Time (US & Canada)",
    offset: "-05:00",
  },
  {
    value: "America/Chicago",
    label: "Central Time (US & Canada)",
    offset: "-06:00",
  },
  {
    value: "America/Denver",
    label: "Mountain Time (US & Canada)",
    offset: "-07:00",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time (US & Canada)",
    offset: "-08:00",
  },
  { value: "America/Anchorage", label: "Alaska", offset: "-09:00" },
  { value: "Pacific/Honolulu", label: "Hawaii", offset: "-10:00" },
  { value: "Europe/London", label: "London", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Berlin", offset: "+01:00" },
  { value: "Europe/Moscow", label: "Moscow", offset: "+03:00" },
  { value: "Asia/Dubai", label: "Dubai", offset: "+04:00" },
  { value: "Asia/Kolkata", label: "Mumbai, Kolkata", offset: "+05:30" },
  { value: "Asia/Bangkok", label: "Bangkok", offset: "+07:00" },
  { value: "Asia/Singapore", label: "Singapore", offset: "+08:00" },
  { value: "Asia/Tokyo", label: "Tokyo", offset: "+09:00" },
  { value: "Australia/Sydney", label: "Sydney", offset: "+11:00" },
  { value: "Pacific/Auckland", label: "Auckland", offset: "+13:00" },
];

/**
 * Language options
 */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "es", label: "Spanish", nativeLabel: "Espanol" },
  { value: "fr", label: "French", nativeLabel: "Francais" },
  { value: "de", label: "German", nativeLabel: "Deutsch" },
  { value: "it", label: "Italian", nativeLabel: "Italiano" },
  { value: "pt", label: "Portuguese", nativeLabel: "Portugues" },
  { value: "nl", label: "Dutch", nativeLabel: "Nederlands" },
  { value: "ja", label: "Japanese", nativeLabel: "Nihongo" },
  { value: "ko", label: "Korean", nativeLabel: "Hangugeo" },
  { value: "zh", label: "Chinese", nativeLabel: "Zhongwen" },
];

/**
 * Get timezone label by value
 */
export function getTimezoneLabel(timezone: string): string {
  const option = TIMEZONE_OPTIONS.find((tz) => tz.value === timezone);
  return option ? option.label : timezone;
}

/**
 * Get language label by value
 */
export function getLanguageLabel(language: string): string {
  const option = LANGUAGE_OPTIONS.find((lang) => lang.value === language);
  return option ? option.label : language;
}

/**
 * Format timezone with offset
 */
export function formatTimezoneWithOffset(timezone: string): string {
  const option = TIMEZONE_OPTIONS.find((tz) => tz.value === timezone);
  if (option) {
    return `(GMT${option.offset}) ${option.label}`;
  }
  return timezone;
}

/**
 * Get current user timezone from browser
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Get current browser language
 */
export function getBrowserLanguage(): string {
  try {
    const lang = navigator.language.split("-")[0];
    const supported = LANGUAGE_OPTIONS.find((l) => l.value === lang);
    return supported ? lang : "en";
  } catch {
    return "en";
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date for account display
 */
export function formatAccountDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
