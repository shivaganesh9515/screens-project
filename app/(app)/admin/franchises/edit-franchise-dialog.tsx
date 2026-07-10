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
import { Pencil } from "lucide-react";
import { updateFranchise } from "./franchise-actions";
import type { FranchiseWithDetails, OrgMember } from "./types";

interface EditFranchiseDialogProps {
  franchise: FranchiseWithDetails;
  managers: OrgMember[];
}

export function EditFranchiseDialog({ franchise, managers }: EditFranchiseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(franchise.name);
  const [managedBy, setManagedBy] = useState<string>(franchise.managed_by || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateFranchise(franchise.id, {
        name,
        managed_by: managedBy || null,
      });
      toast.success("Franchise updated");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update franchise");
    } finally {
      setSaving(false);
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-xs font-medium"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        }
      />
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Franchise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
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
            <Label>Assign Manager</Label>
            <Select value={managedBy} onValueChange={(value) => setManagedBy(value ?? "")}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No manager</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.user_id} value={manager.user_id}>
                    {getManagerDisplayValue(manager)}
                  </SelectItem>
                ))}
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
            <Button type="submit" disabled={saving} className="rounded-xl">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
