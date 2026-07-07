"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDuration, cn } from "@/lib/utils";
import { ArrowLeft, GripVertical, Plus, Trash2, Save, Image as ImageIcon, Video, Search } from "lucide-react";

interface MediaItem { id: string; name: string; type: string; duration_ms: number | null; storage_path: string; thumbnail_path: string | null; }
interface PlaylistItem { id: string; position: number; duration_ms: number; repeat_count: number; media_items: MediaItem; }
interface Playlist { id: string; name: string; playlist_items: PlaylistItem[]; }

function SortableItem({ item, onRemove, onDurationChange, onRepeatCountChange }: { item: PlaylistItem; onRemove: () => void; onDurationChange: (ms: number) => void; onRepeatCountChange: (count: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center gap-3 rounded-xl bg-card px-4 py-3.5 shadow-sm transition-all duration-200 hover:shadow-card", isDragging && "opacity-90 shadow-card-elevated ring-2 ring-primary/20")}>
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-primary transition-colors"><GripVertical className="h-5 w-5" /></button>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
        {item.media_items.type === "video" ? <Video className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0"><p className="truncate text-sm font-medium text-foreground">{item.media_items.name}</p><p className="text-xs text-muted-foreground">{item.media_items.type === "video" ? `Video · ${formatDuration(item.media_items.duration_ms ?? 10000)}` : "Image"}</p></div>
      <div className="flex items-center gap-2">
        {item.media_items.type === "image" && <div className="w-20"><Input type="number" value={item.duration_ms / 1000} onChange={(e) => onDurationChange(parseInt(e.target.value) * 1000)} className="h-8 text-xs rounded-lg" min={1} max={300} /></div>}
         <div className="w-16"><Input type="number" value={item.repeat_count} onChange={(e) => onRepeatCountChange(Math.max(1, parseInt(e.target.value) || 1))} className="h-8 text-xs rounded-lg" min={1} title="Repeat count" /></div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export function PlaylistBuilder({ playlist, mediaItems, orgId }: { playlist: Playlist; mediaItems: MediaItem[]; orgId: string }) {
  const [items, setItems] = useState<PlaylistItem[]>(playlist.playlist_items);
  const [name, setName] = useState(playlist.name);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: DragEndEvent) => { const { active, over } = event; if (over && active.id !== over.id) { const oldIndex = items.findIndex((i) => i.id === active.id); const newIndex = items.findIndex((i) => i.id === over.id); setItems(arrayMove(items, oldIndex, newIndex)); } };
  const handleRemove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const handleDurationChange = (id: string, ms: number) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, duration_ms: ms } : i));
  const handleRepeatCountChange = (id: string, count: number) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, repeat_count: count } : i));
  const handleAddItems = async (mediaItemIds: string[]) => {
    const newItems: PlaylistItem[] = mediaItemIds.map((mediaId, i) => { const media = mediaItems.find((m) => m.id === mediaId)!; const maxPosition = items.length > 0 ? Math.max(...items.map((it) => it.position)) : 0; return { id: `new_${mediaId}_${Date.now()}`, position: maxPosition + i + 1, duration_ms: media.type === "video" ? (media.duration_ms ?? 10000) : 10000, repeat_count: 1, media_items: media }; });
    setItems((prev) => [...prev, ...newItems]); setAddOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("playlists").update({ name }).eq("id", playlist.id);
    await supabase.from("playlist_items").delete().eq("playlist_id", playlist.id);
    const inserts = items.map((item, i) => ({ playlist_id: playlist.id, media_item_id: item.media_items.id, position: i, duration_ms: item.duration_ms, repeat_count: item.repeat_count }));
    const { error } = await supabase.from("playlist_items").insert(inserts);
    if (error) toast.error("Failed to save");
    else { toast.success("Playlist saved"); router.refresh(); }
    setSaving(false);
  };

  const filteredMedia = mediaItems.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const totalDuration = items.reduce((sum, i) => sum + i.duration_ms, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/playlists"><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="text-lg font-semibold max-w-xs h-10 rounded-xl border-border" />
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="rounded-xl gap-2" type="button">
                  <Plus className="h-4 w-4" /> Add Items
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg rounded-2xl"><DialogHeader><DialogTitle>Add Media Items</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-xl pl-10" /></div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredMedia.map((media) => (
                    <div key={media.id} onClick={() => handleAddItems([media.id])} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 transition-all hover:bg-muted/50 hover:border-primary/30 active:scale-[0.99]">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">{media.type === "video" ? <Video className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}</div>
                      <div className="flex-1 min-w-0"><p className="truncate text-sm font-medium">{media.name}</p><p className="text-xs text-muted-foreground">{media.type === "video" ? `Video · ${formatDuration(media.duration_ms ?? 10000)}` : "Image"}</p></div>
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>

      <div className="flex items-center gap-3"><Badge variant="secondary" className="rounded-lg">{items.length} items</Badge><span className="text-sm text-muted-foreground">Total: {formatDuration(totalDuration)}</span></div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center"><ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm font-medium text-muted-foreground">No items in this playlist</p><p className="text-xs text-muted-foreground/60">Click "Add Items" to add media</p></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">{items.map((item) => (<SortableItem key={item.id} item={item} onRemove={() => handleRemove(item.id)} onDurationChange={(ms) => handleDurationChange(item.id, ms)} onRepeatCountChange={(count) => handleRepeatCountChange(item.id, count)} />))}</div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
