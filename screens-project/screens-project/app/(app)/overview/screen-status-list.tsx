"use client";

import { cn } from "@/lib/utils";
import { Monitor, Wifi, WifiOff } from "lucide-react";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";

interface Screen {
  id: string;
  name: string;
  is_online: boolean;
  last_seen: string | null;
  group_id: string | null;
}

export function ScreenStatusList({ screens }: { screens: Screen[] }) {
  return (
    <div className="rounded-lg border border-border/80 bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-card-hover">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Monitor className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-card-foreground">Screen Status</h3>
        </div>
        <span className="text-xs text-muted-foreground">{screens.length} {screens.length === 1 ? "screen" : "screens"}</span>
      </div>
      <div className="p-4">
        {screens.length === 0 ? (
          <div className="py-10 text-center">
            <Monitor className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No screens registered yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {screens.map((screen, idx) => (
              <StaggerWrapper key={screen.id} index={idx} itemsPerRow={1}>
              <div className="group flex items-center justify-between rounded-lg px-4 py-3 transition-all hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className={cn("flex h-2.5 w-2.5 rounded-full", screen.is_online ? "bg-emerald-500" : "bg-red-400")} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {screen.is_online ? <Wifi className="h-3.5 w-3.5 text-emerald-500/70" /> : <WifiOff className="h-3.5 w-3.5 text-red-400/70" />}
                    <span className="text-sm font-medium text-card-foreground">{screen.name}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{screen.is_online ? "Online" : "Offline"}</span>
              </div>
              </StaggerWrapper>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
