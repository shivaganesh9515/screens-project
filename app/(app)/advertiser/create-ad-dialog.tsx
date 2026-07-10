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
import { Plus, Monitor, Bus, Car, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

type ScreenType = "static" | "bus" | "auto";
type Orientation = "landscape" | "portrait";

export function CreateAdvertisementDialog({
  advertiserId,
  orgId,
  mediaItems,
  franchises,
}: CreateAdvertisementDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mediaItemId, setMediaItemId] = useState<string>("");
  const [screenType, setScreenType] = useState<ScreenType>("static");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const screenTypeOptions: { value: ScreenType; label: string; icon: typeof Monitor }[] = [
    { value: "static", label: "Static", icon: Monitor },
    { value: "bus", label: "Bus", icon: Bus },
    { value: "auto", label: "Auto", icon: Car },
  ];

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

      // Insert the ad with type + orientation
      const { data: ad, error: adError } = await supabase
        .from("ads")
        .insert({
          advertiser_id: advertiserId,
          org_id: orgId,
          name: name.trim(),
          media_item_id: mediaItemId,
          screen_type: screenType,
          orientation: orientation,
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
      setScreenType("static");
      setOrientation("landscape");
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

          {/* Screen Type Selector */}
          <div className="space-y-2">
            <Label>Advertisement Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {screenTypeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = screenType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScreenType(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-150",
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input hover:border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation Selector */}
          <div className="space-y-2">
            <Label>Orientation</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["landscape", "portrait"] as Orientation[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOrientation(opt)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-150",
                    orientation === opt
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input hover:border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  <Maximize2
                    className={cn(
                      "h-5 w-5 transition-transform",
                      opt === "portrait" && "rotate-90"
                    )}
                  />
                  <span className="text-xs font-medium capitalize">{opt}</span>
                </button>
              ))}
            </div>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="rounded-xl">
              {creating ? "Creating..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
