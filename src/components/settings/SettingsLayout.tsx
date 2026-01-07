"use client";

import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

export function SettingsLayout({
  children,
  sidebar,
  className,
}: SettingsLayoutProps) {
  return (
    <div className={cn("flex min-h-[calc(100vh-4rem)] gap-8", className)}>
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
