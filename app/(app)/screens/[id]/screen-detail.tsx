"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft, Edit2, Save, X, Monitor, Wifi, Smartphone,
  Play, Clock, Tag, Layers, ExternalLink, MapPin, Maximize2,
  Copy, Check, Bus, Car, MonitorSmartphone, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

interface Screen {
  id: string;
  name: string;
  is_online: boolean;
  last_seen: string | null;
  group_id: string | null;
  tags: string[] | null;
  resolution: string | null;
  paired_at: string | null;
  unique_number: string | null;
  orientation: string | null;
  size_type: string | null;
  screen_type: string | null;
  connectivity_type: string | null;
  lat: number | null;
  lng: number | null;
  latitude: number | null;
  longitude: number | null;
  screen_groups: { name: string } | null;
  franchises: { name: string } | null;
}

interface GpsLocation {
  latitude: number;
  longitude: number;
  recorded_at: string;
  accuracy?: number;
}

interface Group { id: string; name: string; }
interface Schedule { id: string; playlists: { name: string } | null; is_default: boolean; }

const screenTypeMeta: Record<string, { icon: typeof MonitorSmartphone; label: string; color: string }> = {
  static: { icon: MonitorSmartphone, label: "Static", color: "bg-blue-50 text-blue-600" },
  bus: { icon: Bus, label: "Bus", color: "bg-amber-50 text-amber-600" },
  auto: { icon: Car, label: "Auto", color: "bg-purple-50 text-purple-600" },
};

export function ScreenDetail({ screen, groups, schedules, orgId, latestGpsLocation }: {
  screen: Screen;
  groups: Group[];
  schedules: Schedule[];
  orgId: string;
  latestGpsLocation?: GpsLocation | null;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(screen.name);
  const [groupId, setGroupId] = useState(screen.group_id ?? "");
  const [tags, setTags] = useState(screen.tags?.join(", ") ?? "");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">((screen.orientation as "landscape" | "portrait") || "landscape");
  const [sizeType, setSizeType] = useState(screen.size_type ?? "");
  const [screenType, setScreenType] = useState<"static" | "bus" | "auto">((screen.screen_type as "static" | "bus" | "auto") || "static");
  const [connectivityType, setConnectivityType] = useState<"sim" | "wifi">((screen.connectivity_type as "sim" | "wifi") || "wifi");
  // Use latitude/longitude (the canonical columns); fall back to lat/lng for backward compat
  const canonicalLat = screen.latitude ?? screen.lat;
  const canonicalLng = screen.longitude ?? screen.lng;
  const [lat, setLat] = useState(canonicalLat?.toString() ?? "");
  const [lng, setLng] = useState(canonicalLng?.toString() ?? "");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const showLocation = screenType === "static";

  const handleSave = async () => {
    setSaving(true);
    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    const updates: Record<string, unknown> = {
      name,
      group_id: groupId || null,
      tags: tagArray,
      orientation,
      size_type: sizeType || null,
      screen_type: screenType,
      connectivity_type: connectivityType,
      ...(showLocation && lat && lng
        ? {
            // Write to both column sets during migration period
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          }
        : { latitude: null, longitude: null, lat: null, lng: null }),
    };

    const { error } = await supabase.from("screens").update(updates).eq("id", screen.id);
    if (error) toast.error("Failed to update screen");
    else { toast.success("Screen updated"); setEditing(false); router.refresh(); }
    setSaving(false);
  };

  const handleCopyUnique = () => {
    if (screen.unique_number) {
      navigator.clipboard.writeText(screen.unique_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const screenTypeMetaCurrent = screen.screen_type ? screenTypeMeta[screen.screen_type] : null;
  const ScreenTypeIcon = screenTypeMetaCurrent?.icon ?? MonitorSmartphone;

  const connectivityMeta: Record<string, { icon: typeof Wifi; label: string }> = {
    wifi: { icon: Wifi, label: "WiFi" },
    sim: { icon: Smartphone, label: "SIM (4G/5G)" },
  };
  const ConnIcon = screen.connectivity_type ? connectivityMeta[screen.connectivity_type]?.icon ?? Wifi : Wifi;

  const infoItems = [
    { icon: Layers, label: "Group", value: screen.screen_groups?.name ?? "—" },
    { icon: Layers, label: "Franchise", value: screen.franchises?.name ?? "—" },
    { icon: Monitor, label: "Resolution", value: screen.resolution ?? "Unknown" },
    { icon: Clock, label: "Paired At", value: formatDate(screen.paired_at) },
    { icon: Clock, label: "Last Seen", value: formatRelativeTime(screen.last_seen) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link href="/screens">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground transition-all hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Screens
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Main info card */}
          <div className="rounded-2xl border border-border bg-card shadow-card">
            <div className="p-6 sm:p-8">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>
                  <div className="min-w-0">
                    {editing ? (
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="text-lg font-semibold h-10 rounded-xl max-w-xs" />
                    ) : (
                      <h2 className="text-xl font-bold text-foreground truncate">{screen.name}</h2>
                    )}
                    <Badge variant="outline" className={cn("mt-1.5 gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium", screen.is_online ? "border-success/20 bg-success/5 text-success" : "border-destructive/20 bg-destructive/5 text-destructive")}>
                      <span className={cn("flex h-1.5 w-1.5 rounded-full", screen.is_online ? "bg-success" : "bg-destructive")} />
                      {screen.is_online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
                {editing ? (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-xl"><Save className="mr-1 h-4 w-4" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditing(false);
                      setOrientation((screen.orientation as "landscape" | "portrait") || "landscape");
                      setSizeType(screen.size_type ?? "");
                      setScreenType((screen.screen_type as "static" | "bus" | "auto") || "static");
                      setConnectivityType((screen.connectivity_type as "sim" | "wifi") || "wifi");
                      setLat(canonicalLat?.toString() ?? "");
                      setLng(canonicalLng?.toString() ?? "");
                    }} className="rounded-xl"><X className="mr-1 h-4 w-4" /> Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-xl gap-2 shrink-0"><Edit2 className="h-4 w-4" /> Edit</Button>
                )}
              </div>

              {/* Unique Number Card — prominently displayed */}
              {screen.unique_number && (
                <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-5 mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-primary/60 uppercase tracking-wider mb-1">Unique Number</p>
                        <p className="text-2xl font-bold font-mono tracking-[0.1em] text-primary truncate">
                          {screen.unique_number}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verification/audit trail ID — use this when referencing this screen device
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-xl gap-1.5 border-primary/20 hover:bg-primary/5"
                      onClick={handleCopyUnique}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}

              {/* If no unique number, show a subtle placeholder */}
              {!screen.unique_number && (
                <div className="rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 p-4 mb-6">
                  <p className="text-xs text-muted-foreground text-center">No unique number assigned</p>
                </div>
              )}

              <Separator className="mb-6" />

              {/* Metadata Grid — 2x2 */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Hardware &amp; Connectivity</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Orientation */}
                  <div className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <Maximize2 className="h-3.5 w-3.5" />
                      Orientation
                    </div>
                    {editing ? (
                      <ToggleGroup value={[orientation]} onValueChange={(v) => v && v[0] && setOrientation(v[0] as "landscape" | "portrait")} className="gap-1.5">
                        <ToggleGroupItem value="landscape" className={cn("flex-1 rounded-lg h-9 text-xs gap-1.5", orientation === "landscape" && "bg-primary text-primary-foreground")}>
                          <Maximize2 className="h-3 w-3 rotate-0" /> Landscape
                        </ToggleGroupItem>
                        <ToggleGroupItem value="portrait" className={cn("flex-1 rounded-lg h-9 text-xs gap-1.5", orientation === "portrait" && "bg-primary text-primary-foreground")}>
                          <Maximize2 className="h-3 w-3 rotate-90" /> Portrait
                        </ToggleGroupItem>
                      </ToggleGroup>
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Maximize2 className={cn("h-4 w-4 text-muted-foreground", screen.orientation === "portrait" && "rotate-90")} />
                        <span className="capitalize">{screen.orientation ?? "—"}</span>
                      </div>
                    )}
                  </div>

                  {/* Size Type */}
                  <div className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <Monitor className="h-3.5 w-3.5" />
                      Screen Size
                    </div>
                    {editing ? (
                      <Select value={sizeType || "none"} onValueChange={(v) => setSizeType(v === "none" || v === null ? "" : v)}>
                        <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not set</SelectItem>
                          <SelectItem value="32in">32 inch</SelectItem>
                          <SelectItem value="43in">43 inch</SelectItem>
                          <SelectItem value="55in">55 inch</SelectItem>
                          <SelectItem value="65in">65 inch</SelectItem>
                          <SelectItem value="75in">75 inch</SelectItem>
                          <SelectItem value="86in">86 inch</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{screen.size_type ?? "—"}</p>
                    )}
                  </div>

                  {/* Screen Type */}
                  <div className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <ScreenTypeIcon className="h-3.5 w-3.5" />
                      Screen Type
                    </div>
                    {editing ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { value: "static" as const, icon: MonitorSmartphone, label: "Static" },
                          { value: "bus" as const, icon: Bus, label: "Bus" },
                          { value: "auto" as const, icon: Car, label: "Auto" },
                        ].map((st) => (
                          <button
                            key={st.value}
                            type="button"
                            onClick={() => {
                              setScreenType(st.value);
                              if (st.value !== "static") { setLat(""); setLng(""); }
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-lg border py-2 px-1 transition-all text-center",
                              screenType === st.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <st.icon className="h-4 w-4" />
                            <span className="text-[10px] font-medium">{st.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {screen.screen_type ? (
                          <>
                            <ScreenTypeIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{screen.screen_type}</span>
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connectivity Type */}
                  <div className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <ConnIcon className="h-3.5 w-3.5" />
                      Connectivity
                    </div>
                    {editing ? (
                      <ToggleGroup value={[connectivityType]} onValueChange={(v) => v && v[0] && setConnectivityType(v[0] as "sim" | "wifi")} className="gap-1.5">
                        <ToggleGroupItem value="wifi" className={cn("flex-1 rounded-lg h-9 text-xs gap-1.5", connectivityType === "wifi" && "bg-primary text-primary-foreground")}>
                          <Wifi className="h-3.5 w-3.5" /> WiFi
                        </ToggleGroupItem>
                        <ToggleGroupItem value="sim" className={cn("flex-1 rounded-lg h-9 text-xs gap-1.5", connectivityType === "sim" && "bg-primary text-primary-foreground")}>
                          <Smartphone className="h-3.5 w-3.5" /> SIM (4G/5G)
                        </ToggleGroupItem>
                      </ToggleGroup>
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {screen.connectivity_type ? (
                          <>
                            <ConnIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{connectivityMeta[screen.connectivity_type]?.label ?? screen.connectivity_type}</span>
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location (for static screens) */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
                <div className={cn(
                  "rounded-xl p-4 transition-colors",
                  showLocation ? "bg-muted/50 hover:bg-muted/70" : "bg-muted/20"
                )}>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {showLocation ? "GPS Coordinates" :                   "GPS Location"}
                    {!showLocation && (
                      <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0 border-muted-foreground/20 text-muted-foreground/60">
                        Auto-tracked
                      </Badge>
                    )}
                  </div>
                  {editing && showLocation ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="detail-lat" className="text-xs mb-1 block">Latitude</Label>
                        <Input id="detail-lat" type="number" step="any" placeholder="17.3850" value={lat} onChange={(e) => setLat(e.target.value)} className="h-9 rounded-lg" />
                      </div>
                      <div>
                        <Label htmlFor="detail-lng" className="text-xs mb-1 block">Longitude</Label>
                        <Input id="detail-lng" type="number" step="any" placeholder="78.4867" value={lng} onChange={(e) => setLng(e.target.value)} className="h-9 rounded-lg" />
                      </div>
                    </div>
                  ) : showLocation && (canonicalLat !== null || canonicalLng !== null) ? (
                    <p className="text-sm font-medium text-foreground">
                      {canonicalLat}, {canonicalLng}
                    </p>
                  ) : showLocation ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : latestGpsLocation ? (
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">
                        {latestGpsLocation.latitude.toFixed(6)}, {latestGpsLocation.longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(latestGpsLocation.recorded_at).toLocaleString()}
                        {latestGpsLocation.accuracy != null && ` — ±${latestGpsLocation.accuracy}m`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No GPS data yet — location will appear once the screen sends a heartbeat
                    </p>
                  )}
                </div>
              </div>

              {/* Info grid — Group, Resolution, Paired At, Last Seen */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Info</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {infoItems.map((item) => (
                    <div key={item.label} className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </div>
                      {item.label === "Group" && editing ? (
                        <Select value={groupId || "none"} onValueChange={(v) => setGroupId(v === "none" || v === null ? "" : v)}>
                          <SelectTrigger className="mt-1 rounded-xl h-9"><SelectValue placeholder="No group" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No group</SelectItem>
                            {groups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </div>
                {editing ? (
                  <Input className="mt-1 rounded-xl" placeholder="lobby, main, tv (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                ) : (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {screen.tags?.length ? screen.tags.map((tag) => (<Badge key={tag} variant="secondary" className="rounded-lg text-xs font-normal">{tag}</Badge>)) : <span className="text-sm text-muted-foreground">—</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Assigned Playlists */}
          <div className="rounded-2xl border border-border bg-card shadow-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Assigned Playlists</h3>
                  <p className="text-xs text-muted-foreground">{schedules.length} schedule(s)</p>
                </div>
              </div>
              {schedules.length === 0 ? (
                <EmptyState icon={Play} title="No playlists assigned" description="Add a schedule from the Schedule page" className="py-8 border-0" />
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 transition-colors hover:bg-muted">
                      <p className="text-sm font-medium text-foreground">{s.playlists?.name ?? "Unknown"}</p>
                      <Badge variant={s.is_default ? "secondary" : "default"} className="rounded-lg text-xs">{s.is_default ? "Default" : "Scheduled"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Link */}
          <Link href="/schedule">
            <div className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Manage Schedule</h3>
                    <p className="text-xs text-muted-foreground">Configure when content plays</p>
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
