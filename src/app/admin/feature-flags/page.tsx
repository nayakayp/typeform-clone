"use client";

import { useSession } from "next-auth/react";
import { AdminHeader, FeatureFlagsPanel } from "@/components/admin";

export default function AdminFeatureFlagsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Feature Flags"
        description="Control feature rollouts and A/B testing"
      />

      <FeatureFlagsPanel isSuper={session?.user?.role === "super_admin"} />
    </div>
  );
}
