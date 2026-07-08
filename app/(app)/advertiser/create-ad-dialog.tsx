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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaItem {
  id: string;
  name: string;
}

interface Franchise {
  id: string;
  name: string;
}

interface CreateAdvertisementDialogProps {
  advertiserId: string;
  orgId: string;
  mediaItems: MediaItem[];
  franchises: Franchise[];
}

export function CreateAdvertisementDialog({
  advertiserId,
  orgId,
  mediaItems,
  franchises,
}: CreateAdvertisementDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mediaItemId, setMediaItemId] = useState<string>("");
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleFranchiseToggle = (franchiseId: string) => {
    setSelectedFranchises((prev) =>
      prev.includes(franchiseId)
        ? prev.filter((id) => id !== franchiseId)
        : [...prev, franchiseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Advertisement name is required");
      return;
    }

    if (!mediaItemId) {
      toast.error("Please select a media item");
      return;
    }

    if (selectedFranchises.length === 0) {
      toast.error("Please select at least one franchise");
      return;
    }

    setCreating(true);

    try {
      const supabase = createClient();

      // Insert the ad
      const { data: ad, error: adError } = await supabase
        .from("ads")
        .insert({
          advertiser_id: advertiserId,
          org_id: orgId,
          name: name.trim(),
          media_item_id: mediaItemId,
          status: "pending",
        })
        .select("id")
        .single();

      if (adError) throw adError;

      // Insert franchise targets
      const franchiseTargets = selectedFranchises.map((franchiseId) => ({
        ad_id: ad.id,
        franchise_id: franchiseId,
        status: "pending",
      }));

      const { error: targetsError } = await supabase
        .from("ad_franchise_targets")
        .insert(franchiseTargets);

      if (targetsError) throw targetsError;

      toast.success("Advertisement created successfully");
      setOpen(false);
      setName("");
      setMediaItemId("");
      setSelectedFranchises([]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create advertisement");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl gap-1.5" type="button">
            <Plus className="h-4 w-4" /> Create Advertisement
          </Button>
        }
      />
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Advertisement Name</Label>
            <Input
              placeholder="Enter advertisement name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Select Media</Label>
            <Select value={mediaItemId} onValueChange={(value) => setMediaItemId(value ?? "")}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Choose a media item" />
              </SelectTrigger>
              <SelectContent>
                {mediaItems.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No media items available
                  </SelectItem>
                ) : (
                  mediaItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target Franchises</Label>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-input p-2 space-y-1">
              {franchises.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No franchises available</p>
              ) : (
                franchises.map((franchise) => (
                  <label
                    key={franchise.id}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedFranchises.includes(franchise.id)}
                      onCheckedChange={() => handleFranchiseToggle(franchise.id)}
                    />
                    <span className="text-sm">{franchise.name}</span>
                  </label>
                ))
              )}
            </div>
            {selectedFranchises.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedFranchises.length} franchise(s) selected
              </p>
            )}
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
              {creating ? "Creating..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
