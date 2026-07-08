import { formatFileSize } from "@/lib/utils";
import { Image, Video, FileImage } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  type: string;
  size_bytes: number;
  thumbnail_path: string | null;
}

export function RecentMedia({ mediaItems }: { mediaItems: MediaItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="font-semibold text-card-foreground">Recent Media</h3>
        <span className="text-xs text-muted-foreground">{mediaItems.length} items</span>
      </div>
      <div className="p-6">
        {mediaItems.length === 0 ? (
          <div className="py-12 text-center">
            <FileImage className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No media uploaded yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Upload your first image or video.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mediaItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3.5 rounded-xl bg-muted/50 px-4 py-3 transition-colors hover:bg-muted">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  {item.type === "video" ? <Video className="h-5 w-5 text-primary" /> : <Image className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.type === "video" ? "Video" : "Image"} · {formatFileSize(item.size_bytes ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
