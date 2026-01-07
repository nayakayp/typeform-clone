"use client";

import {
  SettingsLayout,
  SettingsSidebar,
  NotificationPreferences,
} from "@/components/settings";

export default function NotificationSettingsPage() {
  return (
    <SettingsLayout sidebar={<SettingsSidebar />}>
      <NotificationPreferences />
    </SettingsLayout>
  );
}
