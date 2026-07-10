"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface PendingAdTarget {
  id: string;
  status: string;
  reviewed_at: string | null;
  ads: {
    id: string;
    name: string;
    created_at: string;
    advertisers: { name: string } | null;
  } | null;
}

interface ApprovalActionsProps {
  pendingAds: PendingAdTarget[];
  franchiseId: string;
}

export function ApprovalActions({ pendingAds, franchiseId }: ApprovalActionsProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async (adId: string, targetId: string) => {
    setApprovingId(targetId);
    try {
      const res = await fetch(`/api/ads/${adId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchise_id: franchiseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to approve ad");
        return;
      }
      toast.success("Ad approved successfully");
      router.refresh();
    } catch {
      toast.error("Network error — could not approve ad");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (adId: string, targetId: string) => {
    setRejectingId(targetId);
    try {
      const res = await fetch(`/api/ads/${adId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchise_id: franchiseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to reject ad");
        return;
      }
      toast.success("Ad rejected");
      router.refresh();
    } catch {
      toast.error("Network error — could not reject ad");
    } finally {
      setRejectingId(null);
    }
  };

  if (pendingAds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          No pending approvals.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Ads targeting your franchise will appear here
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
              Advertiser
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingAds.map((target) => {
            const ad = target.ads;
            const advertiserName = ad?.advertisers?.name ?? "—";
            const isLoading = approvingId === target.id || rejectingId === target.id;

            return (
              <TableRow
                key={target.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <span className="font-medium text-foreground">
                    {ad?.name ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {advertiserName}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ad?.created_at
                    ? format(new Date(ad.created_at), "MMM d, yyyy")
                    : "—"}
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-medium text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      disabled={isLoading}
                      onClick={() => ad && handleApprove(ad.id, target.id)}
                    >
                      {approvingId === target.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      disabled={isLoading}
                      onClick={() => ad && handleReject(ad.id, target.id)}
                    >
                      {rejectingId === target.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
