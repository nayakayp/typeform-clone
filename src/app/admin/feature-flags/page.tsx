"use client";

import { useSession } from "@/lib/auth/client";
import { AdminHeader, FeatureFlagsPanel } from "@/components/admin";
import type { ExtendedUser } from "@/types/auth";

export default function AdminFeatureFlagsPage() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser | undefined;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Feature Flags"
        description="Control feature rollouts and A/B testing"
      />

      <FeatureFlagsPanel isSuper={user?.role === "super_admin"} />
    </div>
  );
}
