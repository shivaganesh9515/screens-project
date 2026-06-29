"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";

interface Schedule { id: string; screen_id: string | null; group_id: string | null; playlist_id: string | null; template_id: string | null; is_default: boolean; priority: number; start_at: string | null; end_at: string | null; recurrence: { days?: number[]; time_start?: string; time_end?: string } | null; screens: { name: string } | null; screen_groups: { name: string } | null; playlists: { name: string } | null; templates: { name: string } | null; }
interface Screen { id: string; name: string; }
interface Playlist { id: string; name: string; }
interface Template { id: string; name: string; }

export function ScheduleCalendar({ schedules, screens, playlists, templates, orgId }: { schedules: Schedule[]; screens: Screen[]; playlists: Playlist[]; templates: Template[]; orgId: string }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<"screen" | "group">("screen");
  const [screenId, setScreenId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [contentType, setContentType] = useState<"playlist" | "template">("playlist");
  const [isDefault, setIsDefault] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const events = schedules.filter((s) => s.screens?.name || s.screen_groups?.name).map((s) => ({
    id: s.id,
    title: `${s.playlists?.name ?? s.templates?.name ?? "Unknown"} - ${s.screens?.name ?? s.screen_groups?.name ?? "All"}`,
    start: s.start_at ?? undefined,
    end: s.end_at ?? undefined,
    backgroundColor: s.is_default ? "#4A7CF7" : "#6B95FF",
    borderColor: s.is_default ? "#4A7CF7" : "#6B95FF",
    textColor: "#ffffff",
    extendedProps: { schedule: s },
  }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const scheduleData: any = { org_id: orgId, playlist_id: contentType === "playlist" ? playlistId || null : null, template_id: contentType === "template" ? templateId || null : null, is_default: isDefault, priority: isDefault ? 0 : 1 };
    if (target === "screen") scheduleData.screen_id = screenId || null;
    if (!isDefault) { scheduleData.start_at = startAt || null; scheduleData.end_at = endAt || null; }
    const { error } = await supabase.from("schedules").insert(scheduleData);
    if (error) toast.error("Failed");
    else { toast.success("Schedule created"); setOpen(false); setScreenId(""); setPlaylistId(""); setTemplateId(""); setStartAt(""); setEndAt(""); router.refresh(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) { toast.success("Deleted"); router.refresh(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger><Button className="rounded-full gap-2 h-10"><Plus className="h-4 w-4" /> Add Schedule Rule</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-2xl"><DialogHeader><DialogTitle>Create Schedule Rule</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2"><Label>Target Type</Label><Select value={target} onValueChange={(v) => v && setTarget(v as "screen" | "group")}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="screen">Screen</SelectItem><SelectItem value="group">Group</SelectItem></SelectContent></Select></div>
                <div className="flex-1 space-y-2"><Label>{target === "screen" ? "Screen" : "Group"}</Label><Select value={screenId} onValueChange={(v) => v && setScreenId(v)}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={`Select ${target}`} /></SelectTrigger><SelectContent>{screens.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Content Type</Label><Select value={contentType} onValueChange={(v) => v && setContentType(v as "playlist" | "template")}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="playlist">Playlist</SelectItem><SelectItem value="template">Template</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>{contentType === "playlist" ? "Playlist" : "Template"}</Label><Select value={contentType === "playlist" ? playlistId : templateId} onValueChange={(v) => { if (v) { if (contentType === "playlist") setPlaylistId(v); else setTemplateId(v); } }}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={`Select ${contentType}`} /></SelectTrigger><SelectContent>{(contentType === "playlist" ? playlists : templates).map((item) => (<SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>))}</SelectContent></Select></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="isDefault" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded border-border h-4 w-4 text-primary" /><Label htmlFor="isDefault" className="text-sm">Default schedule (always-on)</Label></div>
              {!isDefault && (<div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="h-11 rounded-xl" /></div><div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="h-11 rounded-xl" /></div></div>)}
              <Button type="submit" disabled={saving} className="w-full rounded-full h-11">{saving ? "Creating..." : "Create Schedule Rule"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="fullcal-wrap rounded-2xl bg-card p-5 shadow-card">
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
          events={events} height="auto" dayMaxEventRows={2} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Schedule Rules</h3>
        {schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center"><CalendarIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No schedule rules yet</p></div>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between rounded-xl bg-card px-5 py-3.5 shadow-sm transition-all hover:shadow-card">
                <div className="flex items-center gap-3">
                  <Badge variant={schedule.is_default ? "secondary" : "default"} className="rounded-lg">{schedule.is_default ? "Default" : "Scheduled"}</Badge>
                  <div><p className="text-sm font-medium">{schedule.playlists?.name ?? schedule.templates?.name ?? "Unknown"}</p><p className="text-xs text-muted-foreground">{schedule.screens?.name ?? schedule.screen_groups?.name ?? "All"} · Priority {schedule.priority}</p></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule.id)} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
