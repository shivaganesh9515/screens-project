"use client";

import { Building2, Monitor, Megaphone, Clock, Users, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";

const stats = [
  {
    icon: <Building2 className="text-primary" />,
    label: "Total Franchises",
    value: 12,
    description: "Active franchise locations",
  },
  {
    icon: <Monitor className="text-emerald-500" />,
    label: "Total Screens",
    value: 48,
    description: "Across all franchises",
  },
  {
    icon: <Megaphone className="text-amber-500" />,
    label: "Total Advertisers",
    value: 8,
    description: "Active ad accounts",
  },
  {
    icon: <Clock className="text-red-400" />,
    label: "Pending Approvals",
    value: 5,
    description: "Awaiting review",
  },
];

const recentActivity = [
  { id: "1", franchise: "Downtown Location", action: "Added 3 new screens", time: "2 hours ago" },
  { id: "2", franchise: "Airport Terminal", action: "Updated ad campaign", time: "5 hours ago" },
  { id: "3", franchise: "Shopping Mall", action: "Approved ad targeting", time: "1 day ago" },
];

const pendingApprovals = [
  { id: "1", franchise: "Metro Station", request: "New screen registration", priority: "High" },
  { id: "2", franchise: "University Campus", request: "Ad campaign approval", priority: "Medium" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Main Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage franchises, screens, and advertisers across your organization
        </p>
      </div>

      {/* ROW 1 — 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <StaggerWrapper key={stat.label} index={idx} itemsPerRow={4}>
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={<CountUp end={stat.value} />}
            />
          </StaggerWrapper>
        ))}
      </div>

      {/* ROW 2 — Split 50/50 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Franchise Activity */}
        <SectionCard
          title="Recent Franchise Activity"
          subtitle="Latest updates from your franchise network"
        >
          <div className="max-h-[340px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No recent activity"
                description="Franchise activity will appear here"
                className="py-10 border-0"
              />
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, idx) => (
                  <StaggerWrapper key={item.id} index={idx} itemsPerRow={1}>
                    <div className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-muted/50">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {item.franchise}
                        </p>
                        <p className="text-xs text-muted-foreground/70">{item.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {item.time}
                      </span>
                    </div>
                  </StaggerWrapper>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Pending Franchise Approvals */}
        <SectionCard
          title="Pending Franchise Approvals"
          subtitle="Requests requiring your attention"
        >
          <div className="max-h-[340px] overflow-y-auto">
            {pendingApprovals.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No pending approvals"
                description="All franchise requests have been reviewed"
                className="py-10 border-0"
              />
            ) : (
              <div className="space-y-1">
                {pendingApprovals.map((item, idx) => (
                  <StaggerWrapper key={item.id} index={idx} itemsPerRow={1}>
                    <div className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-muted/50">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {item.franchise}
                        </p>
                        <p className="text-xs text-muted-foreground/70">{item.request}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        item.priority === "High"
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </StaggerWrapper>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
