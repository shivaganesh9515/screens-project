"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import {
  Megaphone,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  CalendarDays,
  MonitorSmartphone,
  DownloadCloud,
  Table2,
  BarChart3,
  Hourglass,
  Activity,
} from "lucide-react";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";

interface AdItem {
  id: string;
  name: string;
  status: string;
  media_item_id: string | null;
  created_at: string;
  media_items: { name: string; type: string } | null;
}

interface FranchiseTarget {
  ad_id: string;
  franchise_id: string;
  status: string;
  reviewed_at: string | null;
  franchises: { name: string };
}

interface PlayLog {
  id: string;
  ad_id: string;
  screen_id: string | null;
  started_at: string;
  duration_ms: number | null;
  screens: { name: string } | null;
}

interface Franchise {
  id: string;
  name: string;
}

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

const statusColors: Record<string, string> = {
  approved: COLORS.success,
  pending: COLORS.warning,
  rejected: COLORS.destructive,
};

const statusIcons: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 className="h-4 w-4 text-success" />,
  pending: <Hourglass className="h-4 w-4 text-warning" />,
  rejected: <XCircle className="h-4 w-4 text-destructive" />,
};

export function AdvertiserAnalyticsDashboard({
  ads,
  franchiseTargets,
  playLogs,
  franchises,
}: {
  ads: AdItem[];
  franchiseTargets: FranchiseTarget[];
  playLogs: PlayLog[];
  franchises: Franchise[];
}) {
  const [dateRange, setDateRange] = useState("30d");
  const [adFilter, setAdFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter play logs by date range
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

  // Filter logs by ad
  const filteredLogs = useMemo(() => {
    if (adFilter === "all") return dateFiltered;
    return dateFiltered.filter((log) => log.ad_id === adFilter);
  }, [dateFiltered, adFilter]);

  // Filter ads by status
  const filteredAds = useMemo(() => {
    if (statusFilter === "all") return ads;
    return ads.filter((ad) => ad.status === statusFilter);
  }, [ads, statusFilter]);

  // ---- KPIs ----
  const totalPlays = playLogs.length;
  const activeAds = ads.filter((a) => a.status === "approved").length;
  const pendingAds = ads.filter((a) => a.status === "pending").length;
  const approvedFranchiseTargets = franchiseTargets.filter((t) => t.status === "approved").length;

  // ---- Per-ad play counts ----
  const adPlayData = useMemo(() => {
    const playsByAd: Record<string, { plays: number; totalDuration: number }> = {};
    for (const log of playLogs) {
      if (!playsByAd[log.ad_id]) {
        playsByAd[log.ad_id] = { plays: 0, totalDuration: 0 };
      }
      playsByAd[log.ad_id].plays++;
      playsByAd[log.ad_id].totalDuration += log.duration_ms ?? 0;
    }

    return ads.map((ad) => ({
      id: ad.id,
      name: ad.name,
      status: ad.status,
      plays: playsByAd[ad.id]?.plays ?? 0,
      totalDuration: playsByAd[ad.id]?.totalDuration ?? 0,
    })).sort((a, b) => b.plays - a.plays);
  }, [ads, playLogs]);

  // ---- Franchise approval breakdown per ad ----
  const adFranchiseStatus = useMemo(() => {
    const result: Record<string, { franchiseId: string; franchiseName: string; status: string }[]> = {};
    for (const target of franchiseTargets) {
      if (!result[target.ad_id]) result[target.ad_id] = [];
      result[target.ad_id].push({
        franchiseId: target.franchise_id,
        franchiseName: target.franchises?.name ?? "Unknown",
        status: target.status,
      });
    }
    return result;
  }, [franchiseTargets]);

  // ---- Plays per franchise ----
  const playsByFranchise = useMemo(() => {
    const map: Record<string, { plays: number; name: string }> = {};
    // We don't have franchise_id on play_logs directly, so we use ad_franchise_targets to determine which
    // franchises an ad targets, and count plays per ad grouped by franchise
    for (const log of filteredLogs) {
      const targets = franchiseTargets.filter((t) => t.ad_id === log.ad_id);
      for (const target of targets) {
        if (!map[target.franchise_id]) {
          map[target.franchise_id] = { plays: 0, name: target.franchises?.name ?? "Unknown" };
        }
        map[target.franchise_id].plays++;
      }
    }
    return Object.entries(map)
      .map(([id, data]) => ({ id, name: data.name, plays: data.plays }))
      .sort((a, b) => b.plays - a.plays);
  }, [filteredLogs, franchiseTargets]);

  // ---- Export CSV ----
  const exportCSV = () => {
    const headers = "Ad Name,Status,Plays,Total Duration (s)\n";
    const rows = adPlayData
      .map(
        (ad) =>
          `"${ad.name}","${ad.status}",${ad.plays},${(ad.totalDuration / 1000).toFixed(1)}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-analytics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Ad Plays",
      value: totalPlays.toLocaleString(),
      icon: Play,
      color: COLORS.primary,
      bg: "bg-blue-50",
    },
    {
      label: "Active Ads",
      value: `${activeAds} / ${ads.length}`,
      subtitle: `${activeAds} approved`,
      icon: Megaphone,
      color: COLORS.success,
      bg: "bg-emerald-50",
    },
    {
      label: "Franchise Reach",
      value: `${approvedFranchiseTargets} / ${franchiseTargets.length}`,
      subtitle: `${((approvedFranchiseTargets / Math.max(1, franchiseTargets.length)) * 100).toFixed(0)}% approved`,
      icon: MonitorSmartphone,
      color: COLORS.purple,
      bg: "bg-purple-50",
    },
    {
      label: "Pending Approvals",
      value: pendingAds.toString(),
      subtitle: `${pendingAds} ads awaiting review`,
      icon: Clock,
      color: COLORS.warning,
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">Filters</span>
          <div className="h-4 w-px bg-border mx-1" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <Select value={adFilter} onValueChange={(v) => v && setAdFilter(v)}>
            <SelectTrigger className="w-[170px] h-9 rounded-xl">
              <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All ads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ads</SelectItem>
              {ads.map((ad) => (
                <SelectItem key={ad.id} value={ad.id}>{ad.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[150px] h-9 rounded-xl">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
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
                  {card.label === "Total Ad Plays" ? (
                    <CountUp end={totalPlays} className="text-2xl font-bold tracking-tight text-card-foreground" as="p" />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-card-foreground">{card.value}</p>
                  )}
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  )}
                </div>
                <div className={`rounded-xl ${card.bg} p-3 transition-transform duration-200 group-hover:scale-110`}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
            </div>
          </StaggerWrapper>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ad Performance Chart */}
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="mb-4 font-semibold text-card-foreground">Ad Performance by Plays</h3>
          {adPlayData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No ads created yet</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adPlayData.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={140} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #ECEFF4", boxShadow: "0 4px 12px rgba(16,26,46,0.06)", fontSize: "13px" }}
                    formatter={(value: any) => [value.toLocaleString(), "Plays"]}
                  />
                  <Bar dataKey="plays" radius={[0, 4, 4, 0]} barSize={18}>
                    {adPlayData.slice(0, 10).map((entry) => (
                      <Cell key={entry.id} fill={statusColors[entry.status] || COLORS.primary} fillOpacity={0.85} />
                    ))}
                  </Bar>
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Plays by Franchise */}
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="mb-4 font-semibold text-card-foreground">Plays by Franchise Location</h3>
          {playsByFranchise.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MonitorSmartphone className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No play data across franchises yet</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playsByFranchise} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #ECEFF4", boxShadow: "0 4px 12px rgba(16,26,46,0.06)", fontSize: "13px" }}
                  />
                  <Bar dataKey="plays" radius={[4, 4, 0, 0]} barSize={32}>
                    {playsByFranchise.map((entry) => (
                      <Cell key={entry.id} fill={COLORS.primary} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Ad Cards with Franchise Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Ad Details & Franchise Approvals</h3>
        </div>

        {filteredAds.length === 0 ? (
          <div className="rounded-2xl bg-card p-12 text-center shadow-sm">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No ads match your filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAds.map((ad) => {
              const playCount = adPlayData.find((a) => a.id === ad.id)?.plays ?? 0;
              const franchiseStatuses = adFranchiseStatus[ad.id] ?? [];
              const approvedCount = franchiseStatuses.filter((f) => f.status === "approved").length;
              const pendingCount = franchiseStatuses.filter((f) => f.status === "pending").length;
              const rejectedCount = franchiseStatuses.filter((f) => f.status === "rejected").length;

              return (
                <div key={ad.id} className="group rounded-2xl bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
                  {/* Ad header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground truncate">{ad.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ad.media_items?.name ?? "No media"} • {ad.media_items?.type ?? "—"}
                      </p>
                    </div>
                    <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ad.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                      ad.status === "pending" ? "bg-amber-50 text-amber-700" :
                      "bg-rose-50 text-rose-700"
                    }`}>
                      {statusIcons[ad.status]}
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                  </div>

                  {/* Play count */}
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Play className="h-3.5 w-3.5" />
                    <span><strong className="text-card-foreground">{playCount.toLocaleString()}</strong> plays</span>
                  </div>

                  {/* Franchise approval breakdown */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Franchise Approvals</p>
                    {franchiseStatuses.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60">No franchise targets configured</p>
                    ) : (
                      <>
                        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-muted">
                          {approvedCount > 0 && (
                            <div className="h-full bg-success transition-all" style={{ width: `${(approvedCount / franchiseStatuses.length) * 100}%` }} />
                          )}
                          {pendingCount > 0 && (
                            <div className="h-full bg-warning transition-all" style={{ width: `${(pendingCount / franchiseStatuses.length) * 100}%` }} />
                          )}
                          {rejectedCount > 0 && (
                            <div className="h-full bg-destructive transition-all" style={{ width: `${(rejectedCount / franchiseStatuses.length) * 100}%` }} />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-success" /> {approvedCount} approved
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-warning" /> {pendingCount} pending
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-destructive" /> {rejectedCount} rejected
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            {filteredLogs.length.toLocaleString()} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ad</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Screen</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Started</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-muted-foreground">
                    <Play className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    No play logs recorded yet for your ads
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 50).map((log) => {
                  const adName = ads.find((a) => a.id === log.ad_id)?.name ?? "Unknown Ad";
                  return (
                    <tr key={log.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-3.5 w-3.5 text-rose-500" />
                          {adName}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {log.screens?.name ?? "Unknown"}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {formatDate(log.started_at)}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
