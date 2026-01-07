"use client";

import {
  SettingsLayout,
  SettingsSidebar,
  AccountDetails,
} from "@/components/settings";

export default function AccountSettingsPage() {
  return (
    <SettingsLayout sidebar={<SettingsSidebar />}>
      <AccountDetails />
    </SettingsLayout>
  );
}
