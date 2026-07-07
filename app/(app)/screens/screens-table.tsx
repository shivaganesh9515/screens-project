"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Search, Trash2, MonitorSmartphone, ExternalLink } from "lucide-react";

interface Screen {
  id: string;
  name: string;
  is_online: boolean;
  last_seen: string | null;
  group_id: string | null;
  tags: string[] | null;
  screen_groups: { name: string } | null;
}

interface Group { id: string; name: string; }

export function ScreensTable({ screens, groups, orgId }: { screens: Screen[]; groups: Group[]; orgId: string }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const supabase = createClient();
  const router = useRouter();

  const isScreenOnline = (s: Screen) => s.is_online && s.last_seen && Date.now() - new Date(s.last_seen).getTime() < 90_000;

  const filtered = screens.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const online = isScreenOnline(s);
    const matchesStatus = statusFilter === "all" || (statusFilter === "online" ? online : !online);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("screens").delete().eq("id", id);
    if (error) toast.error("Failed to delete screen");
    else { toast.success("Screen deleted"); router.refresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search screens..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-full pl-10 border-border bg-muted" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {[
            { key: "all" as const, label: "All" },
            { key: "online" as const, label: "Online" },
            { key: "offline" as const, label: "Offline" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                statusFilter === opt.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Group</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Seen</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</TableHead>
              <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <MonitorSmartphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No screens found</p>
                  <p className="text-xs text-muted-foreground/60">{search ? "Try a different search term" : "Add a screen to get started"}</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((screen) => (
                <TableRow key={screen.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Link href={`/screens/${screen.id}`} className="flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors">
                      {screen.name}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", isScreenOnline(screen) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", isScreenOnline(screen) ? "bg-emerald-500" : "bg-red-500")} />
                      {isScreenOnline(screen) ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{screen.screen_groups?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeTime(screen.last_seen)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {screen.tags?.slice(0, 2).map((tag) => (<Badge key={tag} variant="secondary" className="rounded-full text-xs font-normal">{tag}</Badge>))}
                      {(screen.tags?.length ?? 0) > 2 && (<Badge variant="secondary" className="rounded-full text-xs font-normal">+{screen.tags!.length - 2}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger 
                         render={
                          <Button variant="ghost" 
                          size="sm" onClick={() => handleDelete(screen.id)} 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        />
                      <TooltipContent>Delete screen</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
