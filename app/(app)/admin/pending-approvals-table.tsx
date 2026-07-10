"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, Clock } from "lucide-react";

interface PendingAd {
  id: string;
  name: string;
  created_at: string;
  advertisers: { name: string } | null;
  ad_franchise_targets: {
    franchises: { name: string } | null;
  }[] | null;
}

interface PendingApprovalsTableProps {
  ads: PendingAd[];
}

export function PendingApprovalsTable({ ads }: PendingApprovalsTableProps) {
  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">No pending approvals.</p>
        <p className="text-xs text-muted-foreground/60">
          All ad submissions have been reviewed
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
              Ad Name
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Advertiser
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Franchise
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id} className="group hover:bg-muted/30 transition-colors">
              <TableCell>
                <span className="font-medium text-foreground">{ad.name}</span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {ad.advertisers?.name ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(ad.ad_franchise_targets ?? []).length > 0 ? (
                    (ad.ad_franchise_targets ?? []).map((target, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-full text-xs font-normal"
                      >
                        {target.franchises?.name ?? "Unknown"}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(ad.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                >
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/approvals/${ad.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-medium"
                  >
                    Review
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
