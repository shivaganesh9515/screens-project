"use client";

import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Search,
  Trash2,
  MonitorSmartphone,
  ExternalLink,
  Wifi,
  Smartphone,
  Maximize2,
  Bus,
  Car,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

interface Screen {
  id: string;
  name: string;
  is_online: boolean;
  last_seen: string | null;
  group_id: string | null;
  franchise_id: string | null;
  tags: string[] | null;
  unique_number: string | null;
  orientation: string | null;
  screen_type: string | null;
  connectivity_type: string | null;
  screen_groups: { name: string } | null;
  franchises: { name: string } | null;
}

interface Franchise {
  id: string;
  name: string;
}

const PAGE_SIZE = 15;

const screenTypeMeta: Record<string, { icon: typeof MonitorSmartphone; label: string; color: string }> = {
  static: { icon: MonitorSmartphone, label: "Static", color: "bg-blue-50 text-blue-600" },
  bus: { icon: Bus, label: "Bus", color: "bg-amber-50 text-amber-600" },
  auto: { icon: Car, label: "Auto", color: "bg-purple-50 text-purple-600" },
};

function ScreenTypeBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-sm text-muted-foreground">—</span>;
  const meta = screenTypeMeta[type];
  if (!meta) return <span className="text-sm text-muted-foreground">{type}</span>;
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", meta.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-sm text-muted-foreground">{meta.label}</span>
    </div>
  );
}

function ConnectivityIcon({ type }: { type: string | null }) {
  if (!type) return null;
  const Icon = type === "wifi" ? Wifi : Smartphone;
  const label = type === "wifi" ? "WiFi" : "SIM (4G/5G)";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function AdminScreensTable({
  screens,
  franchises,
  orgId,
}: {
  screens: Screen[];
  franchises: Franchise[];
  orgId: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const supabase = createClient();
  const router = useRouter();

  const isScreenOnline = (s: Screen) =>
    s.is_online && s.last_seen && Date.now() - new Date(s.last_seen).getTime() < 90_000;

  const filtered = useMemo(() => {
    return screens.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.unique_number?.toLowerCase() || "").includes(search.toLowerCase());
      const online = isScreenOnline(s);
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "online" ? online : !online);
      const matchesFranchise =
        franchiseFilter === "all" || s.franchise_id === franchiseFilter;
      return matchesSearch && matchesStatus && matchesFranchise;
    });
  }, [screens, search, statusFilter, franchiseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedScreens = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("screens").delete().eq("id", id);
    if (error) toast.error("Failed to delete screen");
    else {
      toast.success("Screen deleted");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search screens or unique #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-full pl-10 border-border bg-muted"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {[
            { key: "all" as const, label: "All" },
            { key: "online" as const, label: "Online" },
            { key: "offline" as const, label: "Offline" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setStatusFilter(opt.key);
                setCurrentPage(1);
              }}
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

        <div className="w-[180px]">
          <Select
            value={franchiseFilter}
            onValueChange={(v) => {
              setFranchiseFilter(v ?? "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="All Franchises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Franchises</SelectItem>
              <SelectItem value="none">No Franchise</SelectItem>
              {franchises.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    {f.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} screen{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name / Unique #</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orientation</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connectivity</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Franchise</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Group</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Seen</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</TableHead>
              <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedScreens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-20 text-center">
                  <MonitorSmartphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No screens found</p>
                  <p className="text-xs text-muted-foreground/60">
                    {search || franchiseFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "No screens registered yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedScreens.map((screen) => (
                <TableRow key={screen.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Link
                      href={`/screens/${screen.id}`}
                      className="flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{screen.name}</span>
                        {screen.unique_number && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {screen.unique_number}
                          </span>
                        )}
                      </div>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                        isScreenOnline(screen)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isScreenOnline(screen) ? "bg-emerald-500" : "bg-red-500"
                        )}
                      />
                      {isScreenOnline(screen) ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ScreenTypeBadge type={screen.screen_type} />
                  </TableCell>
                  <TableCell>
                    {screen.orientation ? (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Maximize2
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            screen.orientation === "portrait" && "rotate-90"
                          )}
                        />
                        <span className="capitalize">{screen.orientation}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ConnectivityIcon type={screen.connectivity_type} />
                    {!screen.connectivity_type && (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {screen.franchises?.name ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
                        {screen.franchises.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {screen.screen_groups?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(screen.last_seen)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {screen.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                      {(screen.tags?.length ?? 0) > 2 && (
                        <Badge variant="secondary" className="rounded-full text-xs font-normal">
                          +{screen.tags!.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(screen.id)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages around current
                const distance = Math.abs(p - currentPage);
                return p === 1 || p === totalPages || distance <= 1;
              })
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-xs text-muted-foreground">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-medium transition-all",
                      currentPage === p
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
