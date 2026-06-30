"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { Layout, Plus, Trash2, Layers, Check } from "lucide-react";

const presets = [
  { name: "Full Screen", zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 100 }], description: "Single zone, 100% canvas" },
  { name: "L-Bar", zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 80 }, { id: "z2", x: 0, y: 80, w: 100, h: 20 }], description: "Main + bottom ticker" },
  { name: "Split Horizontal", zones: [{ id: "z1", x: 0, y: 0, w: 50, h: 100 }, { id: "z2", x: 50, y: 0, w: 50, h: 100 }], description: "50/50 left/right" },
  { name: "Split Vertical", zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 70 }, { id: "z2", x: 0, y: 70, w: 100, h: 30 }], description: "70/30 top/bottom" },
  { name: "Picture-in-Picture", zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 100 }, { id: "z2", x: 70, y: 5, w: 25, h: 25 }], description: "Main + overlay corner" },
];

interface Template { id: string; name: string; is_preset: boolean; zones: any[]; playlists: { name: string } | null; created_at: string; }

export function TemplatesList({ templates, orgId }: { templates: Template[]; orgId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreatePreset = async (presetIndex: number) => {
    const preset = presets[presetIndex]; setCreating(true);
    const { error } = await supabase.from("templates").insert({ name: preset.name, org_id: orgId, is_preset: true, zones: JSON.stringify(preset.zones) });
    if (!error) { toast.success("Template created"); router.refresh(); } setCreating(false);
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPreset === null) return; setCreating(true);
    const preset = presets[selectedPreset];
    const { error } = await supabase.from("templates").insert({ name, org_id: orgId, is_preset: false, zones: JSON.stringify(preset.zones) });
    if (error) toast.error("Failed");
    else { toast.success("Template created"); setOpen(false); setName(""); router.refresh(); } setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Deleted"); router.refresh(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight text-foreground">Templates</h2><p className="text-sm text-muted-foreground">Create and manage screen layout templates</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger><Button className="rounded-xl gap-2 h-10 shadow-sm" type="button"><Plus className="h-4 w-4" /> New Template</Button></DialogTrigger>
          <DialogContent className="sm:max-w-xl rounded-2xl"><DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="space-y-2"><Label>Template Name</Label><Input placeholder="My Custom Layout" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl" /></div>
              <div className="space-y-2"><Label>Base Layout</Label>
                <div className="grid grid-cols-2 gap-3">
                  {presets.map((preset, i) => (
                    <button key={preset.name} type="button" onClick={() => setSelectedPreset(i)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${selectedPreset === i ? "border-primary bg-primary-muted" : "border-border hover:border-primary/40"}`}>
                      {selectedPreset === i && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                      <p className="text-sm font-medium">{preset.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={creating || selectedPreset === null} className="rounded-xl">{creating ? "Creating..." : "Create Template"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div><h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preset Layouts</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset, i) => (
            <StaggerWrapper key={preset.name} index={i} itemsPerRow={3}>
            <div className="rounded-2xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"><Layout className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-semibold">{preset.name}</h3><p className="text-xs text-muted-foreground">{preset.description}</p></div>
              </div>
              <div className="aspect-video rounded-xl bg-muted relative overflow-hidden mb-3">
                {preset.zones.map((zone: any) => (<div key={zone.id} className="absolute border-2 border-primary/40 bg-primary/8 rounded-lg" style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }} />))}
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => handleCreatePreset(i)} disabled={creating} type="button"><Plus className="mr-1 h-4 w-4" /> Use Template</Button>
            </div>
            </StaggerWrapper>
          ))}
        </div>
      </div>

      {templates.length > 0 && (
        <div><h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Templates</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, idx) => (
              <StaggerWrapper key={template.id} index={idx} itemsPerRow={3}>
              <div className="group relative rounded-2xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"><Layers className="h-5 w-5 text-primary" /></div>
                    <div><h3 className="font-semibold">{template.name}</h3><p className="text-xs text-muted-foreground">{template.zones.length} zone(s)</p></div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" type="button"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="aspect-video rounded-xl bg-muted relative overflow-hidden">
                  {(template.zones as any[]).map((zone: any) => (                  <div key={zone.id} className="absolute border-2 border-primary/40 bg-primary/8 rounded-lg" style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }} />))}
                </div>
              </div>
              </StaggerWrapper>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
