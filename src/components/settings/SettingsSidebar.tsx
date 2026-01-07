"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Bell, CreditCard, Settings } from "lucide-react";

interface SettingsSidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const settingsItems: SettingsSidebarItem[] = [
  {
    title: "Profile",
    href: "/settings",
    icon: User,
    description: "Manage your profile information",
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: Settings,
    description: "Account details and preferences",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
    description: "Configure notification preferences",
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Security and authentication settings",
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
    description: "Manage your subscription and billing",
  },
];

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)}>
      <h2 className="text-muted-foreground mb-4 px-3 text-xs font-semibold tracking-wider uppercase">
        Settings
      </h2>
      {settingsItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
