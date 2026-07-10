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
import { Plus, Monitor, Bus, Car, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
}

interface CreateAdDialogProps {
  mediaItems: MediaItem[];
  franchiseId: string;
}

type ScreenType = "static" | "bus" | "auto";
type Orientation = "landscape" | "portrait";

export function CreateAdDialog({ mediaItems, franchiseId }: CreateAdDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mediaItemId, setMediaItemId] = useState<string>("");
  const [screenType, setScreenType] = useState<ScreenType>("static");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const screenTypeOptions: { value: ScreenType; label: string; icon: typeof Monitor }[] = [
    { value: "static", label: "Static", icon: Monitor },
    { value: "bus", label: "Bus", icon: Bus },
    { value: "auto", label: "Auto", icon: Car },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter an advertisement name");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/ads/franchise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          media_item_id: mediaItemId || null,
          franchise_id: franchiseId,
          screen_type: screenType,
          orientation: orientation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create advertisement");
      }

      toast.success("Advertisement submitted successfully");
      setOpen(false);
      setName("");
      setMediaItemId("");
      setScreenType("static");
      setOrientation("landscape");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit advertisement");
    } finally {
      setSubmitting(false);
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
      <DialogContent className="rounded-2xl">
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
            <Label>Select Media (Optional)</Label>
            <Select value={mediaItemId} onValueChange={(value) => setMediaItemId(value ?? "")}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Choose media file" />
              </SelectTrigger>
              <SelectContent>
                {mediaItems.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No media available
                  </SelectItem>
                ) : (
                  mediaItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.type})
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl">
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
