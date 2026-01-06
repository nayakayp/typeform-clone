"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EmailSettings } from "../types";

interface EmailSettingsProps {
  settings: EmailSettings;
  onChange: (settings: EmailSettings) => void;
}

export function EmailSettingsPanel({ settings, onChange }: EmailSettingsProps) {
  const updateSetting = <K extends keyof EmailSettings>(
    key: K,
    value: EmailSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const handleDomainsChange = (value: string) => {
    const domains = value
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    updateSetting("domains", domains.length > 0 ? domains : undefined);
  };

  const handleBlockedDomainsChange = (value: string) => {
    const domains = value
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    updateSetting("blockedDomains", domains.length > 0 ? domains : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder text</Label>
        <Input
          id="placeholder"
          value={settings.placeholder || ""}
          onChange={(e) => updateSetting("placeholder", e.target.value)}
          placeholder="name@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domains">Allowed domains (comma-separated)</Label>
        <Textarea
          id="domains"
          value={settings.domains?.join(", ") || ""}
          onChange={(e) => handleDomainsChange(e.target.value)}
          placeholder="example.com, company.org"
          rows={2}
        />
        <p className="text-muted-foreground text-xs">
          Leave empty to allow all domains
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blockedDomains">
          Blocked domains (comma-separated)
        </Label>
        <Textarea
          id="blockedDomains"
          value={settings.blockedDomains?.join(", ") || ""}
          onChange={(e) => handleBlockedDomainsChange(e.target.value)}
          placeholder="spam.com, tempmail.com"
          rows={2}
        />
      </div>
    </div>
  );
}
