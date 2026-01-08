"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { FileText, LayoutTemplate, Plus, Settings } from "lucide-react";

const navItems = [
  {
    label: "Forms",
    href: "/forms",
    icon: FileText,
  },
  {
    label: "Templates",
    href: "/templates",
    icon: LayoutTemplate,
  },
];

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/forms" className="flex items-center gap-2 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg">FormFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-3">
        <Button size="sm" asChild>
          <Link href="/forms">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>

        <Link
          href="/settings"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            pathname.startsWith("/settings")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
        </Link>

        <UserDropdown />
      </div>
    </header>
  );
}
