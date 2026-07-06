"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  BarChart3,
  MonitorSmartphone,
  Play,
  Clock,
  Download,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Image,
  Video,
  Filter,
  DownloadCloud,
  Table2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";

interface PlayLog {
  id: string;
  screen_id: string;
  media_item_id: string;
  playlist_id: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  screens: { name: string } | null;
  media_items: { name: string; type: string } | null;
}
interface Screen { id: string; name: string; is_online: boolean; }
interface MediaItem { id: string; name: string; type: string; }

const COLORS = {
  primary: "#4A7CF7",
  success: "#10B981",
  warning: "#F59E0B",
  destructive: "#F43F5E",
  purple: "#A78BFA",
  blue: "#6B95FF",
  pink: "#EC4899",
  teal: "#14B8A6",
};

export function AnalyticsDashboard({
  playLogs,
  screens,
  mediaItems,
}: {
  playLogs: PlayLog[];
  screens: Screen[];
  mediaItems: MediaItem[];
}) {
  const [dateRange, setDateRange] = useState("30d");
  const [screenFilter, setScreenFilter] = useState("all");
  const [chartView, setChartView] = useState<"overview" | "breakdown">("overview");

  // Filter by date range
  const dateFiltered = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      "7d": 7 * 86400000,
      "30d": 30 * 86400000,
      "90d": 90 * 86400000,
      all: Infinity,
    };
    const cutoff = now - (ranges[dateRange] ?? Infinity);
    return playLogs.filter((log) => new Date(log.started_at).getTime() > cutoff);
  }, [playLogs, dateRange]);

  // Filter by screen
  const filtered = useMemo(() => {
    if (screenFilter === "all") return dateFiltered;
    return dateFiltered.filter((log) => log.screen_id === screenFilter);
  }, [dateFiltered, screenFilter]);

  // KPI calculations
  const totalImpressions = filtered.length;
  const totalPlayTime = filtered.reduce((sum, log) => sum + (log.duration_ms ?? 0), 0);
  const activeScreens = new Set(filtered.map((l) => l.screen_id)).size;
  const onlineScreens = screens.filter((s) => s.is_online).length;
  const uptimePercent = screens.length > 0 ? Math.round((onlineScreens / screens.length) * 100) : 0;
  const avgDuration = totalImpressions > 0 ? Math.round(totalPlayTime / totalImpressions / 1000) : 0;

  // Daily playback trend
  const dailyTrend = useMemo(() => {
    const days: Record<string, { plays: number; duration: number; date: string; label: string }> = {};
    const range = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 30;
    for (let d = range - 1; d >= 0; d--) {
      const date = new Date(Date.now() - d * 86400000);
      const key = date.toISOString().slice(0, 10);
      days[key] = {
        plays: 0,
        duration: 0,
        date: key,
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    }
    for (const log of filtered) {
      const key = new Date(log.started_at).toISOString().slice(0, 10);
      if (days[key]) {
        days[key].plays++;
        days[key].duration += log.duration_ms ?? 0;
      }
    }
    return Object.values(days);
  }, [filtered, dateRange]);

  // Media impressions breakdown
  const mediaBreakdown = useMemo(() => {
    const map: Record<string, { plays: number; totalDuration: number; type: string }> = {};
    for (const log of filtered) {
      const media = log.media_items;
      if (!media) continue;
      if (!map[media.name]) map[media.name] = { plays: 0, totalDuration: 0, type: media.type };
      map[media.name].plays++;
      map[media.name].totalDuration += log.duration_ms ?? 0;
    }
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.plays - a.plays);
  }, [filtered]);

  // Media type distribution
  const typeDistribution = useMemo(() => {
    const types: Record<string, number> = {};
    for (const log of filtered) {
      const type = log.media_items?.type ?? "unknown";
      types[type] = (types[type] ?? 0) + 1;
    }
    return Object.entries(types).map(([name, value]) => ({
      name: name === "image" ? "Image" : name === "video" ? "Video" : name,
      value,
      color: name === "image" ? COLORS.primary : COLORS.purple,
    }));
  }, [filtered]);

  // Per-screen performance (grouped by screen ID, not name — prevents duplicate-name merge bug)
  const screenPerformance = useMemo(() => {
    const map: Record<string, { id: string; name: string; plays: number; avgDuration: number; count: number }> = {};
    for (const log of filtered) {
      const screenId = log.screen_id;
      const screenName = log.screens?.name ?? "Unknown";
      if (!map[screenId]) map[screenId] = { id: screenId, name: screenName, plays: 0, avgDuration: 0, count: 0 };
      map[screenId].plays++;
      map[screenId].avgDuration += log.duration_ms ?? 0;
      map[screenId].count++;
      // Keep name in sync (handles case where screen name changes between plays)
      map[screenId].name = screenName;
    }
    return Object.entries(map).map(([id, data]) => ({
      id,
      name: data.name,
      plays: data.plays,
      avgDuration: data.count > 0 ? Math.round(data.avgDuration / data.count / 1000) : 0,
      uptime: screens.find((s) => s.id === id)?.is_online ?? false,
    }));
  }, [filtered, screens]);

  // Export CSV
  const exportCSV = () => {
    const headers = "Media,Media Type,Screen,Started,Duration (s)\n";
    const rows = filtered
      .map(
        (log) =>
          `"${log.media_items?.name ?? "Unknown"}","${log.media_items?.type ?? "unknown"}","${
            log.screens?.name ?? "Unknown"
          }","${log.started_at}",${((log.duration_ms ?? 0) / 1000).toFixed(1)}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `play-logs-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Previous period comparison (for trends)
  const prevPeriodStats = useMemo(() => {
    const now = Date.now();
    const range = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 30;
    if (range === Infinity) return { impressions: 0, previousImpressions: 0 };

    const currentCutoff = now - range * 86400000;
    const prevCutoff = now - range * 2 * 86400000;

    const current = playLogs.filter((l) => new Date(l.started_at).getTime() > currentCutoff).length;
    const previous = playLogs.filter(
      (l) =>
        new Date(l.started_at).getTime() > prevCutoff &&
        new Date(l.started_at).getTime() <= currentCutoff
    ).length;

    return { impressions: current, previousImpressions: previous };
  }, [playLogs, dateRange]);

  const impressionChange =
    prevPeriodStats.previousImpressions > 0
      ? Math.round(
          ((prevPeriodStats.impressions - prevPeriodStats.previousImpressions) /
            prevPeriodStats.previousImpressions) *
            100
        )
      : 0;

  const stats = [
    {
      label: "Total Impressions",
      value: totalImpressions.toLocaleString(),
      change: impressionChange,
      icon: Play,
      color: COLORS.primary,
      bg: "bg-primary-muted",
    },
    {
      label: "Total Play Time",
      value: formatDuration(totalPlayTime),
      change: null,
      icon: Clock,
      color: COLORS.success,
      bg: "bg-emerald-50",
    },
    {
      label: "Active Screens",
      value: `${activeScreens} / ${screens.length}`,
      subtitle: `${activeScreens} screens active`,
      change: null,
      icon: MonitorSmartphone,
      color: COLORS.warning,
      bg: "bg-amber-50",
    },
    {
      label: "Avg. Duration",
      value: `${avgDuration}s`,
      subtitle: "Per impression",
      change: null,
      icon: TrendingUp,
      color: COLORS.purple,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">Filters</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
          <SelectTrigger className="w-[140px] h-9 rounded-xl">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={screenFilter} onValueChange={(v) => v && setScreenFilter(v)}>
          <SelectTrigger className="w-[170px] h-9 rounded-xl">
            <MonitorSmartphone className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="All screens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Screens</SelectItem>
            {screens.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              onClick={() => setChartView("overview")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                chartView === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="mr-1 inline h-3 w-3" />
              Overview
            </button>
            <button
              onClick={() => setChartView("breakdown")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                chartView === "breakdown"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PieChartIcon className="mr-1 inline h-3 w-3" />
              Breakdown
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 h-9 border-border"
            onClick={exportCSV}
          >
            <DownloadCloud className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card, idx) => (
          <StaggerWrapper key={card.label} index={idx} itemsPerRow={4}>
            <div className="group rounded-2xl bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  {card.label === "Total Impressions" ? (
                    <CountUp end={totalImpressions} className="text-2xl font-bold tracking-tight text-card-foreground" as="p" />
                  ) : card.label === "Total Play Time" || card.label === "Avg. Duration" || card.label === "Active Screens" ? (
                    <p className="text-2xl font-bold tracking-tight text-card-foreground">{card.value}</p>
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-card-foreground">{card.value}</p>
                  )}
                  {card.change !== null && (
                    <div className="flex items-center gap-1">
                      {card.change > 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-success" />
                      ) : card.change < 0 ? (
                        <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                      ) : null}
                      <span
                        className={`text-xs font-medium ${
                          card.change > 0
                            ? "text-success"
                            : card.change < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {card.change > 0 ? "+" : ""}
                        {card.change}% vs prev period
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`rounded-xl ${card.bg} p-3 transition-transform duration-200 group-hover:scale-110`}
                >
                  <card.icon className={`h-5 w-5`} style={{ color: card.color }} />
                </div>
              </div>
            </div>
          </StaggerWrapper>
        ))}
      </div>

      {chartView === "overview" ? (
        <>
          {/* Daily Trend Chart */}
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">Playback Trend</h3>
                <p className="text-xs text-muted-foreground">
                  Daily impression count over time
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Plays</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    interval={dateRange === "7d" ? 0 : 3}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #ECEFF4",
                      boxShadow: "0 4px 12px rgba(16,26,46,0.06)",
                      fontSize: "13px",
                    }}
                    formatter={(value, name) => {
                      const v = typeof value === 'number' ? value.toLocaleString() : String(value ?? '');
                      return [v, name === 'plays' ? 'Plays' : 'Duration (s)'];
                    }}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="plays"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#trendGradient)"
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Media */}
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Top Media by Impressions
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mediaBreakdown.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      width={130}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #ECEFF4",
                        boxShadow: "0 4px 12px rgba(16,26,46,0.06)",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : String(value ?? ''), 'Plays']}
                    />
                    <Bar dataKey="plays" radius={[0, 4, 4, 0]} barSize={18}>
                      {mediaBreakdown.slice(0, 10).map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={entry.type === "image" ? COLORS.primary : COLORS.purple}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Screen Performance */}
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Screen Performance
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={screenPerformance}
                    margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #ECEFF4",
                        boxShadow: "0 4px 12px rgba(16,26,46,0.06)",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="plays" radius={[4, 4, 0, 0]} barSize={28}>
                      {screenPerformance.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={entry.uptime ? COLORS.success : COLORS.destructive}
                          fillOpacity={entry.uptime ? 0.85 : 0.6}
                        />
                      ))}
                    </Bar>
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Breakdown View */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Media Type Distribution */}
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Content Type Distribution
              </h3>
              <div className="flex items-center justify-center">
                <div className="h-52 w-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {typeDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #ECEFF4",
                          boxShadow: "0 4px 12px rgba(16,26,46,0.06)",
                          fontSize: "13px",
                        }}
                        formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : String(value ?? ''), 'Plays']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                {typeDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {((entry.value / filtered.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Duration */}
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="mb-4 font-semibold text-card-foreground">
                Daily Play Time (seconds)
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      interval={3}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #ECEFF4",
                          boxShadow: "0 4px 12px rgba(16,26,46,0.06)",
                          fontSize: "13px",
                        }}
                        formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : '0'}%`, '']}
                      />
                    <Area
                      type="monotone"
                      dataKey="duration"
                      stroke={COLORS.purple}
                      strokeWidth={2}
                      fill="url(#durationGradient)"
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Play Log Table */}
      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Table2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground">Play Log</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalImpressions.toLocaleString()} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Media
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Screen
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Started
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center text-sm text-muted-foreground"
                  >
                    <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    No play logs recorded yet
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                      <div className="flex items-center gap-2">
                        {log.media_items?.type === "video" ? (
                          <Video className="h-3.5 w-3.5 text-purple-500" />
                        ) : (
                          <Image className="h-3.5 w-3.5 text-primary" />
                        )}
                        {log.media_items?.name ?? "Unknown"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground capitalize">
                      {log.media_items?.type ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {log.screens?.name ?? "Unknown"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {formatDate(log.started_at)}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {log.duration_ms ? formatDuration(log.duration_ms) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
