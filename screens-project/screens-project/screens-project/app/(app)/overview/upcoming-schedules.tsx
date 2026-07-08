import { formatDate } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

interface Schedule {
  id: string;
  playlists: { name: string } | null;
  screens: { name: string } | null;
  screen_groups: { name: string } | null;
  start_at: string | null;
}

export function UpcomingSchedules({ schedules }: { schedules: Schedule[] }) {
  return (
    <div className="rounded-lg border border-border/80 bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-card-hover">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Upcoming Schedules</h3>
        </div>
        <span className="text-xs text-muted-foreground">{schedules.length} upcoming</span>
      </div>
      <div className="p-4">
        {schedules.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No schedules created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="group flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-muted/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{schedule.playlists?.name ?? "Unknown Playlist"}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{schedule.screens?.name ?? schedule.screen_groups?.name ?? "All screens"}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{schedule.start_at ? formatDate(schedule.start_at) : "Always"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
