"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Layout,
  Play,
  Plus,
  Trash2,
} from "lucide-react";

interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  playlist_id: string | null;
}

interface Template {
  id: string;
  name: string;
  zones: Zone[];
  is_preset: boolean;
}

interface Playlist {
  id: string;
  name: string;
}

interface ZoneEditorProps {
  template: Template;
  playlists: Playlist[];
  orgId: string;
}

const MIN_ZONE_PCT = 10;

type ResizeHandle =
  | "nw" | "n" | "ne"
  | "w"  | "e"
  | "sw" | "s" | "se";

const HANDLE_POSITIONS: { dir: ResizeHandle; cx: number; cy: number }[] = [
  { dir: "nw", cx: 0, cy: 0 },
  { dir: "n",  cx: 50, cy: 0 },
  { dir: "ne", cx: 100, cy: 0 },
  { dir: "w",  cx: 0, cy: 50 },
  { dir: "e",  cx: 100, cy: 50 },
  { dir: "sw", cx: 0, cy: 100 },
  { dir: "s",  cx: 50, cy: 100 },
  { dir: "se", cx: 100, cy: 100 },
];

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  w: "ew-resize",
  e: "ew-resize",
  sw: "nesw-resize",
  s: "ns-resize",
  se: "nwse-resize",
};

let nextZoneNum = 0;

function generateZoneId(): string {
  nextZoneNum++;
  return `z${Date.now()}_${nextZoneNum}`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, val)));
}

export function ZoneEditor({ template: initialTemplate, playlists, orgId }: ZoneEditorProps) {
  const [template, setTemplate] = useState<Template>({
    ...initialTemplate,
    zones: Array.isArray(initialTemplate.zones) ? initialTemplate.zones : [],
  });
  const [name, setName] = useState(initialTemplate.name);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<{
    zoneId: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    startZone: Zone;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const updateZone = useCallback((zoneId: string, updates: Partial<Zone>) => {
    setTemplate((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)),
    }));
  }, []);

  const removeZone = (zoneId: string) => {
    setTemplate((prev) => ({
      ...prev,
      zones: prev.zones.filter((z) => z.id !== zoneId),
    }));
  };

  const addZone = () => {
    const newZone: Zone = {
      id: generateZoneId(),
      x: 0,
      y: 0,
      w: 50,
      h: 50,
      playlist_id: null,
    };
    setTemplate((prev) => ({
      ...prev,
      zones: [...prev.zones, newZone],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("templates")
      .update({
        name,
        zones: template.zones,
      })
      .eq("id", template.id);

    if (error) {
      toast.error("Failed to save template: " + error.message);
    } else {
      toast.success("Template saved");
      router.refresh();
    }
    setSaving(false);
  };

  const handlePointerDown = useCallback(
    (zoneId: string, handle: ResizeHandle, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);

      const zone = template.zones.find((z) => z.id === zoneId);
      if (!zone) return;

      setDragging({
        zoneId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startZone: { ...zone },
      });
    },
    [template.zones]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;
      if (canvasW <= 0 || canvasH <= 0) return;

      const dx = ((e.clientX - dragging.startX) / canvasW) * 100;
      const dy = ((e.clientY - dragging.startY) / canvasH) * 100;

      const z = dragging.startZone;
      let newX = z.x;
      let newY = z.y;
      let newW = z.w;
      let newH = z.h;

      const handle = dragging.handle;

      // Horizontal changes
      if (handle.includes("e")) {
        newW = z.w + dx;
      }
      if (handle.includes("w")) {
        newW = z.w - dx;
        newX = z.x + dx;
      }

      // Vertical changes
      if (handle.includes("s")) {
        newH = z.h + dy;
      }
      if (handle.includes("n")) {
        newH = z.h - dy;
        newY = z.y + dy;
      }

      // Enforce minimums
      if (newW < MIN_ZONE_PCT) {
        if (handle.includes("w")) {
          newX = z.x + z.w - MIN_ZONE_PCT;
        }
        newW = MIN_ZONE_PCT;
      }
      if (newH < MIN_ZONE_PCT) {
        if (handle.includes("n")) {
          newY = z.y + z.h - MIN_ZONE_PCT;
        }
        newH = MIN_ZONE_PCT;
      }

      // Clamp within canvas bounds
      newX = clamp(newX, 0, 100 - MIN_ZONE_PCT);
      newY = clamp(newY, 0, 100 - MIN_ZONE_PCT);
      if (newX + newW > 100) newW = 100 - newX;
      if (newY + newH > 100) newH = 100 - newY;

      updateZone(dragging.zoneId, { x: Math.round(newX), y: Math.round(newY), w: Math.round(newW), h: Math.round(newH) });
    },
    [dragging, updateZone]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const zoneColors = [
    "border-blue-400 bg-blue-50/40",
    "border-emerald-400 bg-emerald-50/40",
    "border-amber-400 bg-amber-50/40",
    "border-violet-400 bg-violet-50/40",
    "border-rose-400 bg-rose-50/40",
    "border-cyan-400 bg-cyan-50/40",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/templates">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-semibold max-w-xs h-10 rounded-xl border-border"
          />
          <Badge variant="secondary" className="rounded-lg">
            {template.zones.length} zone(s)
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2" onClick={addZone} type="button">
            <Plus className="h-4 w-4" /> Add Zone
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Zone canvas + Zone list side by side */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* Canvas preview */}
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <Label className="mb-4 block">Layout Preview</Label>
          <div
            ref={canvasRef}
            className="aspect-video rounded-xl bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)] relative overflow-hidden border border-border select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            {template.zones.map((zone, i) => {
              const color = zoneColors[i % zoneColors.length];
              return (
                <div
                  key={zone.id}
                  className={`absolute rounded-lg border-2 ${color} transition-shadow hover:ring-2 hover:ring-primary/30 ${dragging?.zoneId === zone.id ? "ring-2 ring-primary/40 shadow-lg z-10" : ""}`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.w}%`,
                    height: `${zone.h}%`,
                    touchAction: "none",
                  }}
                >
                  {/* Zone label */}
                  <div className="flex h-full flex-col items-center justify-center p-2 text-center pointer-events-none">
                    <Layout className="h-5 w-5 text-muted-foreground/60" />
                    <span className="mt-1 text-[10px] font-medium text-muted-foreground">
                      {zone.id}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">
                      {zone.w}×{zone.h}
                    </span>
                  </div>

                  {/* Resize handles */}
                  {HANDLE_POSITIONS.map(({ dir, cx, cy }) => (
                    <div
                      key={dir}
                      className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 z-20 group"
                      style={{
                        left: `${cx}%`,
                        top: `${cy}%`,
                        cursor: HANDLE_CURSORS[dir],
                        touchAction: "none",
                      }}
                      onPointerDown={(e) => handlePointerDown(zone.id, dir, e)}
                    >
                      <div className="w-full h-full rounded-full border-2 border-white bg-foreground/60 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              );
            })}
            {template.zones.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No zones — click &quot;Add Zone&quot; to create one</p>
              </div>
            )}
            {/* Resize hint */}
            {template.zones.length > 0 && !dragging && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-[10px] text-muted-foreground/50 bg-background/60 px-2 py-0.5 rounded-full">
                  Hover a zone edge and drag to resize
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Zone list with playlist assignment */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Zone Playlist Assignment</Label>
          {template.zones.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center">
              <Layout className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No zones yet</p>
              <p className="text-xs text-muted-foreground/60">Click &quot;Add Zone&quot; above</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {template.zones.map((zone, i) => (
                <div
                  key={zone.id}
                  className={`rounded-xl bg-card px-4 py-3.5 shadow-sm border border-border/50 transition-all ${dragging?.zoneId === zone.id ? "ring-2 ring-primary/30 border-primary/30" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${zoneColors[i % zoneColors.length].replace("border-", "bg-").replace("/40", "/20")}`}
                    >
                      <Layout className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{zone.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {zone.w}% × {zone.h}% at ({zone.x}%, {zone.y}%)
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeZone(zone.id)}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1">
                      <Select
                        value={zone.playlist_id ?? ""}
                        onValueChange={(v) => updateZone(zone.id, { playlist_id: v || null })}
                      >
                        <SelectTrigger className="w-full h-9 rounded-lg text-xs">
                          <SelectValue placeholder="Assign a playlist..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" disabled>
                            {playlists.length === 0
                              ? "No playlists available"
                              : "Assign a playlist..."}
                          </SelectItem>
                          <SelectItem value="">None</SelectItem>
                          {playlists.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center gap-2">
                                <Play className="h-3.5 w-3.5" />
                                {p.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
