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

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
}

interface CreateAdDialogProps {
  mediaItems: MediaItem[];
  franchiseId: string;
}

export function CreateAdDialog({ mediaItems, franchiseId }: CreateAdDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mediaItemId, setMediaItemId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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
            <Select value={mediaItemId} onValueChange={setMediaItemId}>
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
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
