"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { FileText, Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      {/* Logo */}
      <Link href="/forms" className="flex items-center gap-2 font-bold">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg">FormFlow</span>
      </Link>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-3">
        <Button size="sm" asChild>
          <Link href="/forms">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>

        <UserDropdown />
      </div>
    </header>
  );
}
