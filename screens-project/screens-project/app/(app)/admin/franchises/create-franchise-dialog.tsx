"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createFranchise } from "./franchise-actions";
import type { OrgMember } from "./types";

interface CreateFranchiseDialogProps {
  managers: OrgMember[];
}

export function CreateFranchiseDialog({ managers }: CreateFranchiseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [managedBy, setManagedBy] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await createFranchise({
        name,
        managed_by: managedBy || null,
      });
      toast.success("Franchise created");
      setOpen(false);
      setName("");
      setManagedBy("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create franchise");
    } finally {
      setCreating(false);
    }
  };

  const getManagerDisplayValue = (manager: OrgMember) => {
    const userData = manager.users as any;
    const name = userData?.raw_user_meta_data?.full_name;
    const email = userData?.email;
    return name || email || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl gap-1.5" type="button">
            <Plus className="h-4 w-4" /> Create Franchise
          </Button>
        }
      />
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create Franchise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Franchise Name</Label>
            <Input
              placeholder="Enter franchise name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Assign Manager (Optional)</Label>
            <Select value={managedBy} onValueChange={setManagedBy}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No managers available
                  </SelectItem>
                ) : (
                  managers.map((manager) => (
                    <SelectItem key={manager.user_id} value={manager.user_id}>
                      {getManagerDisplayValue(manager)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="rounded-xl">
              {creating ? "Creating..." : "Create Franchise"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
