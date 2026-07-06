"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Layers, Plus, Trash2, MonitorSmartphone } from "lucide-react";

interface Group { id: string; name: string; _count?: { screens: number }; }

export function ScreenGroups({ groups, screens, orgId }: { groups: Group[]; screens: Array<{ group_id: string | null }>; orgId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from("screen_groups").insert({ name, org_id: orgId });
    if (error) toast.error("Failed to create group");
    else { toast.success("Group created"); setOpen(false); setName(""); router.refresh(); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("screen_groups").delete().eq("id", id);
    if (error) toast.error("Failed to delete group");
    else { toast.success("Group deleted"); router.refresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Screen Groups</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="rounded-xl gap-1.5" type="button">
                <Plus className="h-4 w-4" /> New Group
              </Button>
            }
          />
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Create Screen Group</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Group Name</Label><Input placeholder="Lobby Screens" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl" /></div>
              <Button type="submit" disabled={creating} className="rounded-xl">{creating ? "Creating..." : "Create Group"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center">
          <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No groups yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3.5 transition-colors hover:bg-muted/70">
              <div>
                <p className="text-sm font-medium text-foreground">{group.name}</p>
                <p className="text-xs text-muted-foreground">{screens.filter((s) => s.group_id === group.id).length} screen(s)</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(group.id)} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" type="button"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
