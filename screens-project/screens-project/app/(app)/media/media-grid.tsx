"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatFileSize, formatDuration } from "@/lib/utils";
import { Search, Grid3X3, List, Trash2, Image as ImageIcon, Video, Film, LayoutGrid } from "lucide-react";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { EmptyState } from "@/components/ui/empty-state";

interface MediaItem { id: string; name: string; type: string; storage_path: string | null; thumbnail_path: string | null; duration_ms: number | null; size_bytes: number | null; folder: string | null; tags: string[] | null; orientation: string | null; source_type: string; external_url: string | null; created_at: string; }

export function MediaGrid({ mediaItems, folders, orgId }: { mediaItems: MediaItem[]; folders: string[]; orgId: string }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [orientationFilter, setOrientationFilter] = useState("all");
  const router = useRouter();
  const supabase = createClient();

  const orientations = [...new Set(mediaItems.map((m) => m.orientation).filter(Boolean))] as string[];

  const filtered = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesFolder = folderFilter === "all" || item.folder === folderFilter;
    const matchesOrientation = orientationFilter === "all" || item.orientation === orientationFilter;
    return matchesSearch && matchesType && matchesFolder && matchesOrientation;
  });

  const handleDelete = async (item: MediaItem) => {
    const toDelete: string[] = [];
    if (item.storage_path) toDelete.push(item.storage_path);
    if (item.thumbnail_path) toDelete.push(item.thumbnail_path);
    if (toDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from("media").remove(toDelete);
      if (storageError) console.warn("Storage delete warning:", storageError.message);
    }
    const { error } = await supabase.from("media_items").delete().eq("id", item.id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); router.refresh(); }
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-full pl-10 border-border bg-muted" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-[130px] h-10 rounded-xl"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        {folders.length > 0 && (
          <Select value={folderFilter} onValueChange={(v) => v && setFolderFilter(v)}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl"><SelectValue placeholder="All folders" /></SelectTrigger>
            <SelectContent>{folders.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
          </Select>
        )}
        {orientations.length > 0 && (
          <Select value={orientationFilter} onValueChange={(v) => v && setOrientationFilter(v)}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl"><SelectValue placeholder="All orientations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orientations</SelectItem>
              {orientations.map((o) => (<SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setView("grid")} className="rounded-lg"><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")} className="rounded-lg"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {view === "grid" ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No media found"
            description="Upload images or videos to get started"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((item, idx) => (
              <StaggerWrapper key={item.id} index={idx} itemsPerRow={5}>
              <div className="group relative rounded-2xl bg-card shadow-card overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
                <div className="aspect-video bg-muted relative">
                  {item.type === "image" ? (
                    item.thumbnail_path ? (
                      <Image src={`${supabaseUrl}/storage/v1/object/public/media/${item.thumbnail_path}`} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground/40" /></div>
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center"><Video className="h-8 w-8 text-muted-foreground/40" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Button variant="destructive" size="icon" className="absolute right-2 top-2 h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  {item.type === "video" && item.source_type === "link" && (
                    <span className="absolute bottom-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-xs border-0 rounded-lg px-2 py-0.5 flex items-center gap-1"><Video className="h-3 w-3" />Live</span>
                  )}
                  {item.type === "video" && item.source_type !== "link" && item.duration_ms && (
                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs border-0 rounded-lg px-2 py-0.5 flex items-center gap-1"><Film className="h-3 w-3" />{formatDuration(item.duration_ms)}</span>
                  )}
                  {item.type === "image" && (
                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs border-0 rounded-lg px-2 py-0.5 flex items-center gap-1"><ImageIcon className="h-3 w-3" />Image</span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">{item.type === "video" ? "Video" : "Image"}{item.size_bytes && <> · {formatFileSize(item.size_bytes)}</>}{item.orientation && <> · {item.orientation.charAt(0).toUpperCase() + item.orientation.slice(1)}</>}{item.source_type === "link" && <> · Live</>}</p>
                </div>
              </div>
              </StaggerWrapper>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30"><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</th><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</th><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orientation</th><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</th><th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folder</th><th className="w-16 px-5 py-3.5"></th></tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium">{item.name}</td>
                  <td className="px-5 py-3.5"><Badge variant="secondary" className="rounded-lg gap-1"><Video className="h-3 w-3" />{item.type === "video" ? "Video" : "Image"}</Badge></td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatFileSize(item.size_bytes ?? 0)}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.duration_ms ? formatDuration(item.duration_ms) : "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.orientation ? (item.orientation.charAt(0).toUpperCase() + item.orientation.slice(1)) : "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.source_type === "link" ? <Badge variant="secondary" className="rounded-lg gap-1"><Video className="h-3 w-3" />Live</Badge> : "Upload"}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.folder ?? "—"}</td>
                  <td className="px-5 py-3.5"><Button variant="ghost" size="sm" onClick={() => handleDelete(item)} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
