import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone, Upload, Play, Plus, Zap } from "lucide-react";

export function QuickActions() {
  return (
    <div className="rounded-lg border border-border/80 bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-card-hover">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Quick Actions</h3>
        </div>
        <Plus className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-wrap gap-3 p-5">
        <Link href="/screens">
          <Button className="rounded-lg gap-2.5 h-10 shadow-sm">
            <MonitorSmartphone className="h-4 w-4" />
            Add Screen
          </Button>
        </Link>
        <Link href="/media">
          <Button variant="outline" className="rounded-lg gap-2.5 h-10 border-border/60 hover:bg-muted hover:border-primary/30">
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </Link>
        <Link href="/playlists">
          <Button variant="outline" className="rounded-lg gap-2.5 h-10 border-border/60 hover:bg-muted hover:border-primary/30">
            <Play className="h-4 w-4" />
            Create Playlist
          </Button>
        </Link>
      </div>
    </div>
  );
}
