"use client";

import {
  SettingsLayout,
  SettingsSidebar,
  SecuritySettings,
} from "@/components/settings";

export default function SecuritySettingsPage() {
  return (
    <SettingsLayout sidebar={<SettingsSidebar />}>
      <SecuritySettings />
    </SettingsLayout>
  );
}
