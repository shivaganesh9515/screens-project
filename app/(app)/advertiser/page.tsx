import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Megaphone,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Play,
  Monitor,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateAdvertisementDialog } from "./create-ad-dialog";

export default async function AdvertiserPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find the advertiser record for the logged-in user
  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("id, org_id")
    .eq("user_id", user.id)
    .single();

  const advertiserId = advertiser?.id;

  // Fetch stats with error handling - display 0 if query fails
  const [
    { count: totalAdsCount },
    { count: pendingAdsCount },
    { count: approvedAdsCount },
    { count: rejectedAdsCount },
  ] = await Promise.all([
    // Total Advertisements: Count all ads by this advertiser
    advertiserId
      ? supabase
          .from("ads")
          .select("*", { count: "exact", head: true })
          .eq("advertiser_id", advertiserId)
      : Promise.resolve({ count: 0, error: null }),
    
    // Pending Approvals: Count ads where status = "pending"
    advertiserId
      ? supabase
          .from("ads")
          .select("*", { count: "exact", head: true })
          .eq("advertiser_id", advertiserId)
          .eq("status", "pending")
      : Promise.resolve({ count: 0, error: null }),
    
    // Approved Advertisements: Count ads where status = "approved"
    advertiserId
      ? supabase
          .from("ads")
          .select("*", { count: "exact", head: true })
          .eq("advertiser_id", advertiserId)
          .eq("status", "approved")
      : Promise.resolve({ count: 0, error: null }),
    
    // Rejected Advertisements: Count ads where status = "rejected"
    advertiserId
      ? supabase
          .from("ads")
          .select("*", { count: "exact", head: true })
          .eq("advertiser_id", advertiserId)
          .eq("status", "rejected")
      : Promise.resolve({ count: 0, error: null }),
  ]);

  const stats = [
    {
      icon: <Megaphone className="text-primary" />,
      label: "Total Advertisements",
      value: totalAdsCount ?? 0,
      description: "All your ad campaigns",
    },
    {
      icon: <Clock className="text-amber-500" />,
      label: "Pending Approvals",
      value: pendingAdsCount ?? 0,
      description: "Awaiting review",
    },
    {
      icon: <CheckCircle className="text-emerald-500" />,
      label: "Approved Advertisements",
      value: approvedAdsCount ?? 0,
      description: "Currently running",
    },
    {
      icon: <XCircle className="text-red-400" />,
      label: "Rejected Advertisements",
      value: rejectedAdsCount ?? 0,
      description: "Needs revision",
    },
  ];

  // Fetch real advertisements belonging to this advertiser
  const { data: myAdvertisements } = advertiserId
    ? await supabase
        .from("ads")
        .select("id, name, status, created_at, media_items(name)")
        .eq("advertiser_id", advertiserId)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Fetch media items belonging to the organization
  const orgId = advertiser?.org_id;
  const { data: mediaItems } = orgId
    ? await supabase
        .from("media_items")
        .select("id, name")
        .eq("org_id", orgId)
        .order("name")
    : { data: [] };

  // Fetch all franchises
  const { data: franchises } = await supabase
    .from("franchises")
    .select("id, name")
    .order("name");

  // Fetch approval status by franchise (ad_franchise_targets with ad and franchise info)
  const { data: approvalByFranchise } = advertiserId
    ? await supabase
        .from("ad_franchise_targets")
        .select("id, status, reviewed_at, ad_id, franchise_id, ads!inner(name, created_at, advertiser_id), franchises!inner(name)")
        .eq("ads.advertiser_id", advertiserId)
        .order("ads(created_at)", { ascending: false })
    : { data: [] };

  // Fetch analytics data: play_logs for advertiser's ads
  const adIds = (myAdvertisements ?? []).map((ad: any) => ad.id);
  const { data: playLogs } = adIds.length > 0
    ? await supabase
        .from("play_logs")
        .select("id, ad_id, screen_id, started_at")
        .in("ad_id", adIds)
        .order("started_at", { ascending: false })
    : { data: [] };

  // Fetch screens belonging to the organization
  const { data: screens } = orgId
    ? await supabase
        .from("screens")
        .select("id, name, is_online")
        .eq("org_id", orgId)
    : { data: [] };

  // Calculate analytics summary
  const totalPlays = playLogs?.length ?? 0;
  const activeScreens = screens?.filter((s: any) => s.is_online)?.length ?? 0;

  // Build ad performance data (play count per ad)
  const adPerformanceMap = new Map<string, { name: string; playCount: number; lastPlayed: string | null; status: string }>();
  (myAdvertisements ?? []).forEach((ad: any) => {
    adPerformanceMap.set(ad.id, {
      name: ad.name,
      playCount: 0,
      lastPlayed: null,
      status: ad.status,
    });
  });
  (playLogs ?? []).forEach((log: any) => {
    const perf = adPerformanceMap.get(log.ad_id);
    if (perf) {
      perf.playCount++;
      if (!perf.lastPlayed || new Date(log.started_at) > new Date(perf.lastPlayed)) {
        perf.lastPlayed = log.started_at;
      }
    }
  });
  const adPerformance = Array.from(adPerformanceMap.values()).sort((a, b) => b.playCount - a.playCount);

  const statusConfig = {
    approved: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    pending: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    rejected: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Advertiser Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage your ad campaigns
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

      {/* Create Advertisement Section */}
      <SectionCard
        title="Create Advertisement"
        subtitle="Submit a new ad campaign for approval"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Create a new advertisement and target it to specific franchises for approval.
          </p>
          <CreateAdvertisementDialog
            advertiserId={advertiserId ?? ""}
            orgId={orgId ?? ""}
            mediaItems={mediaItems ?? []}
            franchises={franchises ?? []}
          />
        </div>
      </SectionCard>

      {/* ROW 2 — Split 50/50 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Advertisements */}
        <SectionCard
          title="My Advertisements"
          subtitle="Your recent ad campaigns"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {myAdvertisements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  You haven't created any advertisements yet.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Create your first ad campaign to get started
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Advertisement
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Media
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Created
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(myAdvertisements ?? []).map((ad: any) => {
                      const status = statusConfig[ad.status as keyof typeof statusConfig] ?? statusConfig.pending;
                      const StatusIcon = status.icon;
                      const mediaName = ad.media_items?.name ?? "—";
                      return (
                        <TableRow
                          key={ad.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <span className="font-medium text-foreground">
                              {ad.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {mediaName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ad.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Approval Status by Franchise */}
        <SectionCard
          title="Approval Status by Franchise"
          subtitle="Breakdown of ad approvals across franchises"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {(approvalByFranchise ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No approval requests available.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Data will appear once your ads are submitted to franchises
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Advertisement
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Franchise
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Reviewed
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(approvalByFranchise ?? []).map((target: any) => {
                      const status = statusConfig[target.status as keyof typeof statusConfig] ?? statusConfig.pending;
                      const StatusIcon = status.icon;
                      const adName = target.ads?.name ?? "—";
                      const franchiseName = target.franchises?.name ?? "—";
                      return (
                        <TableRow
                          key={target.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <span className="font-medium text-foreground">
                              {adName}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {franchiseName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {target.status.charAt(0).toUpperCase() + target.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {target.reviewed_at
                              ? new Date(target.reviewed_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ROW 3 — Advertisement Analytics */}
      <SectionCard
        title="Advertisement Analytics"
        subtitle="Performance metrics and playback statistics"
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Plays</p>
                  <p className="text-2xl font-bold text-foreground">{totalPlays}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Monitor className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Screens</p>
                  <p className="text-2xl font-bold text-foreground">{activeScreens}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved Ads</p>
                  <p className="text-2xl font-bold text-foreground">{approvedAdsCount ?? 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Ads</p>
                  <p className="text-2xl font-bold text-foreground">{pendingAdsCount ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Advertisement Performance */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Recent Advertisement Performance
              </span>
            </div>
            {adPerformance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No analytics available.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Analytics will appear once your ads start playing on screens
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Advertisement
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Play Count
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Last Played
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adPerformance.map((perf, idx) => {
                      const status = statusConfig[perf.status as keyof typeof statusConfig] ?? statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <TableRow
                          key={idx}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <span className="font-medium text-foreground">
                              {perf.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {perf.playCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {perf.lastPlayed
                              ? new Date(perf.lastPlayed).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {perf.status.charAt(0).toUpperCase() + perf.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
