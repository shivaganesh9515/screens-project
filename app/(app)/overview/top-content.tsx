"use client";

import { useMemo } from "react";
import { Image, Video, TrendingUp, Trophy } from "lucide-react";

interface PlayLog {
  started_at: string;
  media_items?: { name: string; type: string } | null;
  duration_ms: number | null;
  screens?: { name: string } | null;
}

interface TopContentProps {
  playLogs: PlayLog[];
}

export function TopContent({ playLogs }: TopContentProps) {
  const topContent = useMemo(() => {
    const contentMap: Record<string, { plays: number; totalDuration: number; type: string; lastPlayed: string }> = {};
    for (const log of playLogs) {
      const media = log.media_items;
      if (!media) continue;
      if (!contentMap[media.name]) {
        contentMap[media.name] = { plays: 0, totalDuration: 0, type: media.type, lastPlayed: "" };
      }
      contentMap[media.name].plays++;
      contentMap[media.name].totalDuration += log.duration_ms ?? 0;
      if (log.started_at > contentMap[media.name].lastPlayed) {
        contentMap[media.name].lastPlayed = log.started_at;
      }
    }
    return Object.entries(contentMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 8);
  }, [playLogs]);

  const maxPlays = topContent[0]?.plays ?? 1;

  return (
    <div className="rounded-lg border border-border/80 bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-card-hover">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="font-semibold text-card-foreground">Top Content</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 30d</span>
      </div>

      <div className="p-4">
        {topContent.length === 0 ? (
          <div className="py-10 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No playback data yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {topContent.map((item, i) => (
              <div key={item.name} className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted/50">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                    i === 0 ? "bg-primary/10 text-primary" :
                    i === 1 ? "bg-slate-200 text-slate-500" :
                    i === 2 ? "bg-amber-100 text-amber-700" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {item.type === "video" ? (
                    <Video className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Image className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground/70">{item.plays} plays</p>
                </div>
                <div className="hidden sm:block w-16">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? "bg-primary" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-500" : "bg-primary/30"
                      }`}
                      style={{ width: `${(item.plays / maxPlays) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
