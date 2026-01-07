"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminHeader, StatsCard } from "@/components/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, BarChart3, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Admin Dashboard"
        description="Monitor and manage your platform"
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            description="registered users"
          />
          <StatsCard
            title="Total Forms"
            value={stats?.totalForms || 0}
            icon={FileText}
            description="created forms"
          />
          <StatsCard
            title="Total Responses"
            value={stats?.totalResponses || 0}
            icon={BarChart3}
            description="form submissions"
          />
          <StatsCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon={Activity}
            description="in the last 7 days"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Activity feed will appear here
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            Admin shortcuts will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
