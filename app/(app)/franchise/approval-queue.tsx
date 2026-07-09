"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PendingApproval {
  id: string;
  adId: string;
  name: string;
  advertiser: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

interface ApprovalQueueProps {
  approvals: PendingApproval[];
  franchiseId: string;
}

export function ApprovalQueue({ approvals, franchiseId }: ApprovalQueueProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleApprove = async (adId: string) => {
    setLoadingStates((prev) => ({ ...prev, [adId]: "approving" }));

    try {
      const response = await fetch(`/api/ads/${adId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ franchise_id: franchiseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve ad");
      }

      toast.success("Advertisement approved successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve ad");
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[adId];
        return newState;
      });
    }
  };

  const handleReject = async (adId: string) => {
    setLoadingStates((prev) => ({ ...prev, [adId]: "rejecting" }));

    try {
      const response = await fetch(`/api/ads/${adId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ franchise_id: franchiseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject ad");
      }

      toast.success("Advertisement rejected successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject ad");
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[adId];
        return newState;
      });
    }
  };

  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          No advertisement requests pending.
        </p>
        <p className="text-xs text-muted-foreground/60">
          All ads have been reviewed
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
              Submitted
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-[150px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.map((approval) => {
            const isLoading = loadingStates[approval.id];
            return (
              <TableRow
                key={approval.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <span className="font-medium text-foreground">
                    {approval.name}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {approval.advertiser}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(approval.submitted).toLocaleDateString()}
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-medium text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => handleApprove(approval.adId)}
                      disabled={!!isLoading}
                    >
                      {isLoading === "approving" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleReject(approval.adId)}
                      disabled={!!isLoading}
                    >
                      {isLoading === "rejecting" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
