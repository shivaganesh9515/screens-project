"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Play, Plus, Search, Trash2, ListMusic } from "lucide-react";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { EmptyState } from "@/components/ui/empty-state";

interface Playlist { id: string; name: string; created_at: string; playlist_items: { count: number } | null; screens: { screens: { name: string }[] } | null; }

export function PlaylistsList({ playlists, orgId }: { playlists: Playlist[]; orgId: string }) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const filtered = playlists.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from("playlists").insert({ name, org_id: orgId });
    if (error) toast.error("Failed to create");
    else { toast.success("Playlist created"); setOpen(false); setName(""); router.refresh(); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); router.refresh(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight text-foreground">Playlists</h2><p className="text-sm text-muted-foreground">Create and manage content playlists</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                  className="rounded-xl gap-2 h-10 shadow-sm"
                  type="button"
              />
            }
          >
              <Plus className="h-4 w-4" />
              Create Playlist
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl"><DialogHeader><DialogTitle>Create Playlist</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Playlist Name</Label><Input placeholder="Morning Loop" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl" /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); setName(""); }} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={creating} className="rounded-full">{creating ? "Creating..." : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search playlists..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-full pl-10 border-border bg-muted" /></div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists found"
          description="Create your first playlist to get started"
        />
      ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((playlist, idx) => (
              <StaggerWrapper key={playlist.id} index={idx} itemsPerRow={3}>
                <div className="group relative rounded-2xl bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"><Play className="h-5 w-5 text-primary" /></div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(playlist.id)} className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" type="button"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <Link href={`/playlists/${playlist.id}`}>
                    <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">{playlist.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{playlist.playlist_items?.count ?? 0} items</p>
                  </Link>
                </div>
              </StaggerWrapper>
            ))}
        </div>
      )}
    </div>
  );
}
