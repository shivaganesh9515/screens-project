"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Image, Video, BarChart3 } from "lucide-react";

interface PlayLog {
  media_items?: { name: string; type: string } | null;
}

interface MediaDistributionChartProps {
  playLogs: PlayLog[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white px-3 py-2.5 text-sm shadow-dropdown">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-card-foreground">{payload[0].value.toLocaleString()} plays</p>
    </div>
  );
};

export function MediaDistributionChart({ playLogs }: MediaDistributionChartProps) {
  const chartData = useMemo(() => {
    const typeCount: Record<string, { plays: number; name: string }> = {};
    const mediaCount: Record<string, { plays: number; type: string }> = {};

    for (const log of playLogs) {
      const media = log.media_items;
      if (!media) continue;
      if (!typeCount[media.type]) {
        typeCount[media.type] = { plays: 0, name: media.type === "image" ? "Image" : "Video" };
      }
      typeCount[media.type].plays++;
      if (!mediaCount[media.name]) {
        mediaCount[media.name] = { plays: 0, type: media.type };
      }
      mediaCount[media.name].plays++;
    }

    const topMedia = Object.entries(mediaCount)
      .map(([name, data]) => ({ name: name.length > 18 ? name.slice(0, 18) + "..." : name, ...data }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 6);

    return { typeData: Object.values(typeCount), mediaData: topMedia };
  }, [playLogs]);

  const imagePlays = chartData.typeData.find((d) => d.name === "Image")?.plays ?? 0;
  const videoPlays = chartData.typeData.find((d) => d.name === "Video")?.plays ?? 0;
  const total = imagePlays + videoPlays;

  return (
    <div className="rounded-lg border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-card-hover">
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Content Distribution</h3>
        </div>
        <p className="text-xs text-muted-foreground pl-10">Media type and top content breakdown</p>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-lg bg-primary/[0.04] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Image className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-card-foreground tabular-nums">{imagePlays.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Image plays</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-lg bg-purple-500/[0.04] px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
            <Video className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-card-foreground tabular-nums">{videoPlays.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Video plays</p>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-4 overflow-hidden rounded-full bg-muted">
          <div className="flex h-2">
            <div className="bg-primary transition-all duration-500" style={{ width: `${(imagePlays / total) * 100}%` }} />
            <div className="bg-purple-500 transition-all duration-500" style={{ width: `${(videoPlays / total) * 100}%` }} />
          </div>
        </div>
      )}

      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Top Content by Plays</h4>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.mediaData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#8B95B5" }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#8B95B5" }} tickLine={false} axisLine={false} width={110} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#F0F3FA' }} />
            <Bar dataKey="plays" radius={[0, 3, 3, 0]} barSize={16}>
              {chartData.mediaData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.type === "image" ? "#4A7CF7" : "#A78BFA"}
                  fillOpacity={0.7 + (1 - i / chartData.mediaData.length) * 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
