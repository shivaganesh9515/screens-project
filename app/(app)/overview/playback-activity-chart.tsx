"use client";

import { useState, useMemo } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { GradientAreaChart } from "@/components/ui/gradient-area-chart";
import { TimeframeToggle } from "@/components/ui/timeframe-toggle";

interface PlayLog {
  started_at: string;
  duration_ms: number | null;
  screens?: { name: string } | null;
}

interface PlaybackActivityChartProps {
  playLogs: PlayLog[];
}

export function PlaybackActivityChart({ playLogs }: PlaybackActivityChartProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y" | "ALL">("1W");

  const chartData = useMemo(() => {
    switch (timeframe) {
      case "1D": {
        const hourly: Record<number, { label: string; plays: number }> = {};
        for (let h = 0; h < 24; h++) {
          hourly[h] = { label: `${h.toString().padStart(2, "0")}:00`, plays: 0 };
        }
        const dayAgo = Date.now() - 86400000;
        for (const log of playLogs) {
          const t = new Date(log.started_at).getTime();
          if (t < dayAgo) continue;
          const h = new Date(log.started_at).getHours();
          if (hourly[h]) hourly[h].plays++;
        }
        return Object.values(hourly);
      }

      case "1W": {
        const daily: Record<string, { label: string; plays: number; date: string }> = {};
        for (let d = 6; d >= 0; d--) {
          const date = new Date(Date.now() - d * 86400000);
          const key = date.toISOString().slice(0, 10);
          daily[key] = {
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            plays: 0,
            date: key,
          };
        }
        for (const log of playLogs) {
          const key = new Date(log.started_at).toISOString().slice(0, 10);
          if (daily[key]) daily[key].plays++;
        }
        return Object.values(daily);
      }

      case "1M": {
        const daily30: Record<string, { label: string; plays: number }> = {};
        for (let d = 29; d >= 0; d--) {
          const date = new Date(Date.now() - d * 86400000);
          const key = date.toISOString().slice(0, 10);
          daily30[key] = {
            label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            plays: 0,
          };
        }
        for (const log of playLogs) {
          const key = new Date(log.started_at).toISOString().slice(0, 10);
          if (daily30[key]) daily30[key].plays++;
        }
        return Object.values(daily30);
      }

      case "1Y": {
        const monthly: Record<string, { label: string; plays: number }> = {};
        for (let m = 11; m >= 0; m--) {
          const date = new Date(Date.now() - m * 30 * 86400000);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthly[key] = {
            label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
            plays: 0,
          };
        }
        for (const log of playLogs) {
          const d = new Date(log.started_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (monthly[key]) monthly[key].plays++;
        }
        return Object.values(monthly);
      }

      case "ALL": {
        const allMonthly: Record<string, { label: string; plays: number }> = {};
        for (const log of playLogs) {
          const d = new Date(log.started_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (!allMonthly[key]) {
            allMonthly[key] = {
              label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
              plays: 0,
            };
          }
          allMonthly[key].plays++;
        }
        return Object.values(allMonthly).sort((a, b) => {
          const [aM, aY] = a.label.split(" ");
          const [bM, bY] = b.label.split(" ");
          return new Date(`${aM} 1, ${aY}`).getTime() - new Date(`${bM} 1, ${bY}`).getTime();
        });
      }
    }
  }, [playLogs, timeframe]);

  const totalPlays = chartData.reduce((sum, d) => sum + d.plays, 0);
  const avgPlays = chartData.length > 0 ? Math.round(totalPlays / chartData.length) : 0;

  return (
    <SectionCard
      title="Playback Activity"
      subtitle="Play count over time"
      action={
        <TimeframeToggle value={timeframe} onValueChange={setTimeframe} />
      }
    >
      <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
        <span>
          Total:{" "}
          <strong className="text-card-foreground tabular-nums">
            {totalPlays.toLocaleString()}
          </strong>
        </span>
        <span>
          Avg/day:{" "}
          <strong className="text-card-foreground tabular-nums">
            {avgPlays}
          </strong>
        </span>
      </div>
      <GradientAreaChart
        data={chartData}
        xKey="label"
        yKey="plays"
        height={250}
        color="#4A7CF7"
        showTooltip
        showGrid
      />
    </SectionCard>
  );
}
