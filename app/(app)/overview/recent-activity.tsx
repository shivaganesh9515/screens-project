"use client";

import { useMemo } from "react";
import { Monitor, Clock, Play } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";

interface PlayLog {
  id: string;
  started_at: string;
  duration_ms: number | null;
  screens?: { name: string } | null;
  media_items?: { name: string; type: string } | null;
}

interface RecentActivityProps {
  playLogs: PlayLog[];
}

export function RecentActivity({ playLogs }: RecentActivityProps) {
  const activities = useMemo(() => {
    const dayAgo = Date.now() - 86400000;
    return playLogs
      .filter((log) => new Date(log.started_at).getTime() > dayAgo)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 15)
      .map((log) => ({
        id: log.id,
        name: log.media_items?.name ?? "Unknown media",
        screen: log.screens?.name ?? "Unknown screen",
        timestamp: log.started_at,
        type: log.media_items?.type ?? "unknown",
      }));
  }, [playLogs]);

  return (
    <SectionCard title="Recent Activity" subtitle="Latest playback and screen events">
      <div className="max-h-[340px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="py-10 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{item.screen}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                  <StatusPill status="playing" size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
