"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, Edit2, Save, X, Monitor, Wifi, WifiOff, Play, Clock, Tag, Layers, ExternalLink } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

interface Screen { id: string; name: string; is_online: boolean; last_seen: string | null; group_id: string | null; tags: string[] | null; resolution: string | null; paired_at: string | null; pairing_code: string | null; screen_groups: { name: string } | null; }
interface Group { id: string; name: string; }
interface Schedule { id: string; playlists: { name: string } | null; is_default: boolean; }

export function ScreenDetail({ screen, groups, schedules, orgId }: { screen: Screen; groups: Group[]; schedules: Schedule[]; orgId: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(screen.name);
  const [groupId, setGroupId] = useState(screen.group_id ?? "");
  const [tags, setTags] = useState(screen.tags?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("screens").update({ name, group_id: groupId || null, tags: tagArray }).eq("id", screen.id);
    if (error) toast.error("Failed to update");
    else { toast.success("Screen updated"); setEditing(false); router.refresh(); }
    setSaving(false);
  };

  const infoItems = [
    { icon: Layers, label: "Group", value: screen.screen_groups?.name ?? "—" },
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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
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
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="rounded-xl"><X className="mr-1 h-4 w-4" /> Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-xl gap-2 shrink-0"><Edit2 className="h-4 w-4" /> Edit</Button>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Info grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {infoItems.map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                    {item.label === "Group" && editing ? (
                      <Select value={groupId || "none"} onValueChange={(v) => setGroupId(v === "none" || v === null ? "" : v)}>
                        <SelectTrigger className="mt-1 rounded-xl h-9"><SelectValue placeholder="No group" /></SelectTrigger>
                        <SelectContent>{groups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-5 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/70">
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
