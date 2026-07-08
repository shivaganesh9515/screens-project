"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface Ad {
  id: string;
  name: string;
  media_name: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface FranchiseAdsTableProps {
  ads: Ad[];
}

const statusConfig = {
  approved: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  pending: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  rejected: {
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export function FranchiseAdsTable({ ads }: FranchiseAdsTableProps) {
  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          No advertisement requests yet.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Create your first advertisement to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Advertisement
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Media
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => {
            const status = statusConfig[ad.status];
            const StatusIcon = status.icon;
            return (
              <TableRow
                key={ad.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <span className="font-medium text-foreground">{ad.name}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ad.media_name || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(ad.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${status.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
