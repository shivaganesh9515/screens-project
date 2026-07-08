"use client";

import { Building2, Monitor, Megaphone, FileText } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "franchise" | "advertiser" | "screen" | "ad";
  title: string;
  entityName: string;
  createdAt: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

const activityConfig = {
  franchise: {
    icon: Building2,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  advertiser: {
    icon: Megaphone,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  screen: {
    icon: Monitor,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  ad: {
    icon: FileText,
    iconBg: "bg-red-400/10",
    iconColor: "text-red-400",
  },
};

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <SectionCard
      title="Recent Franchise Activity"
      subtitle="Latest updates from your franchise network"
    >
      <div className="max-h-[340px] overflow-y-auto">
        {activities.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No recent activity"
            description="Franchise activity will appear here"
            className="py-10 border-0"
          />
        ) : (
          <div className="space-y-1">
            {activities.map((item, idx) => {
              const config = activityConfig[item.type];
              const Icon = config.icon;
              const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              });

              return (
                <StaggerWrapper key={item.id} index={idx} itemsPerRow={1}>
                  <div className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-muted/50">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}
                    >
                      <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {item.entityName}
                      </p>
                      <p className="text-xs text-muted-foreground/70">{item.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {timeAgo}
                    </span>
                  </div>
                </StaggerWrapper>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
