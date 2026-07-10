import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Monitor,
  ListVideo,
  Calendar,
  Clock,
  Megaphone,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApprovalQueue } from "./approval-queue";
import { CreateAdDialog } from "./create-ad-dialog";
import { FranchiseAdsTable } from "./franchise-ads-table";

export default async function FranchisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/setup");

  // Find the franchise managed by the current user
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, org_id")
    .eq("managed_by", user.id)
    .single();

  const franchiseId = franchise?.id;
  const orgId = franchise?.org_id || member.org_id;

  // Fetch stats with error handling - display 0 if query fails
  const [
    { count: myScreensCount },
    { count: myPlaylistsCount },
    { count: mySchedulesCount },
    { count: pendingApprovalsCount },
  ] = await Promise.all([
    // My Screens: Count screens where franchise_id matches
    franchiseId
      ? supabase
          .from("screens")
          .select("*", { count: "exact", head: true })
          .eq("franchise_id", franchiseId)
      : Promise.resolve({ count: 0, error: null }),
    
    // My Playlists: Count playlists in the franchise's org
    supabase
      .from("playlists")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId),
    
    // My Schedules: Count schedules for screens in the franchise
    franchiseId
      ? supabase
          .from("schedules")
          .select("*", { count: "exact", head: true })
          .in("screen_id", 
            await supabase
              .from("screens")
              .select("id")
              .eq("franchise_id", franchiseId)
              .then(({ data }: { data: { id: string }[] | null }) => data?.map(s => s.id) || [])
          )
      : Promise.resolve({ count: 0, error: null }),
    
    // Pending Advertiser Approvals: Count pending ads for this franchise
    franchiseId
      ? supabase
          .from("ad_franchise_targets")
          .select("*", { count: "exact", head: true })
          .eq("franchise_id", franchiseId)
          .eq("status", "pending")
      : Promise.resolve({ count: 0, error: null }),
  ]);

  const stats = [
    {
      icon: <Monitor className="text-emerald-500" />,
      label: "My Screens",
      value: myScreensCount ?? 0,
      description: "Active displays",
    },
    {
      icon: <ListVideo className="text-primary" />,
      label: "My Playlists",
      value: myPlaylistsCount ?? 0,
      description: "Content playlists",
    },
    {
      icon: <Calendar className="text-amber-500" />,
      label: "My Schedules",
      value: mySchedulesCount ?? 0,
      description: "Scheduled sessions",
    },
    {
      icon: <Clock className="text-red-400" />,
      label: "Pending Approvals",
      value: pendingApprovalsCount ?? 0,
      description: "Awaiting review",
    },
  ];

  // Fetch recent activity from franchise's screens, ads, and schedules
  const { data: recentScreens } = franchiseId
    ? await supabase
        .from("screens")
        .select("id, name, created_at")
        .eq("franchise_id", franchiseId)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const { data: recentAds } = franchiseId
    ? await supabase
        .from("ad_franchise_targets")
        .select("id, created_at, ads(id, name, created_at)")
        .eq("franchise_id", franchiseId)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  // Fetch schedules for this franchise's screens
  const { data: franchiseScreens } = franchiseId
    ? await supabase
        .from("screens")
        .select("id")
        .eq("franchise_id", franchiseId)
    : { data: [] };

  const screenIds = (franchiseScreens || []).map((s: { id: string }) => s.id);

  const { data: recentSchedules } = screenIds.length > 0
    ? await supabase
        .from("schedules")
        .select("id, name, created_at, screens(name)")
        .in("screen_id", screenIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  // Build activity feed
  type ActivityItem = {
    id: string;
    type: "screen" | "ad" | "schedule";
    title: string;
    entityName: string;
    createdAt: string;
  };

  const allActivities: ActivityItem[] = [
    ...(recentScreens || []).map((s: { id: string; name: string; created_at: string }) => ({
      id: `screen-${s.id}`,
      type: "screen" as const,
      title: "New screen added",
      entityName: s.name,
      createdAt: s.created_at,
    })),
    ...(recentAds || []).map((target: { id: string; created_at: string; ads?: { id: string; name: string; created_at: string } | null }) => ({
      id: `ad-${target.id}`,
      type: "ad" as const,
      title: "Advertisement submitted",
      entityName: (target.ads as any)?.name || "Unknown Ad",
      createdAt: target.created_at,
    })),
    ...(recentSchedules || []).map((schedule: { id: string; name: string; created_at: string; screens?: { name: string } | null }) => ({
      id: `schedule-${schedule.id}`,
      type: "schedule" as const,
      title: "Schedule created",
      entityName: schedule.name,
      createdAt: schedule.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Fetch pending approvals for this franchise
  const { data: pendingApprovalsData } = franchiseId
    ? await supabase
        .from("ad_franchise_targets")
        .select(`
          id,
          created_at,
          ads(id, name, created_at),
          advertisers(id, name)
        `)
        .eq("franchise_id", franchiseId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const pendingApprovals = (pendingApprovalsData || []).map((target: { id: string; created_at: string; ads?: { id: string; name: string; created_at: string } | null; advertisers?: { id: string; name: string } | null }) => ({
    id: target.id,
    adId: (target.ads as any)?.id || "",
    name: (target.ads as any)?.name || "Unknown Ad",
    advertiser: (target.advertisers as any)?.name || "Unknown Advertiser",
    submitted: target.created_at,
    status: "pending" as const,
  }));

  // Fetch my ad requests (ads submitted by this franchise)
  const { data: myAdRequestsData } = franchiseId
    ? await supabase
        .from("ads")
        .select("id, name, status, created_at, media_items(name)")
        .eq("submitted_by_franchise_id", franchiseId)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const myAdRequests = (myAdRequestsData || []).map((ad: { id: string; name: string; status: string; created_at: string; media_items?: { name: string } | null }) => ({
    id: ad.id,
    name: ad.name,
    media_name: (ad.media_items as any)?.name || null,
    status: ad.status as "approved" | "pending" | "rejected",
    created_at: ad.created_at,
  }));

  // Fetch media items for the franchise's org
  const { data: mediaItems } = franchiseId
    ? await supabase
        .from("media_items")
        .select("id, name, type")
        .eq("org_id", orgId)
        .order("name")
    : { data: [] };

  const activityConfig = {
    screen: {
      icon: Monitor,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    ad: {
      icon: Megaphone,
      iconBg: "bg-red-400/10",
      iconColor: "text-red-400",
    },
    schedule: {
      icon: Calendar,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Franchise Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage your franchise territory, screens, and ad approvals
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
        {/* Recent Territory Activity */}
        <SectionCard
          title="Recent Territory Activity"
          subtitle="Latest updates from your territory"
        >
          <div className="max-h-[340px] overflow-y-auto">
            {allActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Monitor className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No recent activity.</p>
                <p className="text-xs text-muted-foreground/60">
                  Activity will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {allActivities.map((item, idx) => {
                  const config = activityConfig[item.type];
                  const Icon = config.icon;
                  const timeAgo = getRelativeTime(item.createdAt);

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

        {/* Pending Advertiser Approvals */}
        <SectionCard
          title="Pending Advertiser Approvals"
          subtitle="Ads awaiting your review"
        >
          <div className="max-h-[340px] overflow-y-auto">
            <ApprovalQueue
              approvals={pendingApprovals}
              franchiseId={franchiseId || ""}
            />
          </div>
        </SectionCard>
      </div>

      {/* ROW 3 — My Advertisement Requests */}
      <SectionCard
        title="My Advertisement Requests"
        subtitle="Ads you've submitted for review"
        action={
          franchiseId ? (
            <CreateAdDialog
              mediaItems={(mediaItems || []).map((item: { id: string; name: string; type: string }) => ({
                id: item.id,
                name: item.name,
                type: item.type as "image" | "video",
              }))}
              franchiseId={franchiseId}
            />
          ) : undefined
        }
      >
        <div className="max-h-[400px] overflow-y-auto">
          <FranchiseAdsTable ads={myAdRequests} />
        </div>
      </SectionCard>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}
