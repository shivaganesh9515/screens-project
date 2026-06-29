"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Copy, Check, MonitorSmartphone } from "lucide-react";

interface Group { id: string; name: string; }

export function AddScreenModal({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/screens/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, group_id: groupId || null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed"); setLoading(false); return; }
      setPairingCode(data.code);
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  const handleCopy = () => {
    if (pairingCode) { navigator.clipboard.writeText(pairingCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleClose = () => { setOpen(false); setName(""); setGroupId(""); setPairingCode(null); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="rounded-xl gap-2 h-10 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Screen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-card-elevated p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold">{pairingCode ? "Pairing Code" : "Add Screen"}</DialogTitle>
          <DialogDescription>
            {pairingCode ? "Enter this code on your screen's player app to register it." : "Enter a name and group for the new screen."}
          </DialogDescription>
        </DialogHeader>

        {pairingCode ? (
          <div className="space-y-5 px-6 pb-6">
            <div className="rounded-2xl bg-primary-muted p-8 text-center">
              <MonitorSmartphone className="mx-auto mb-4 h-8 w-8 text-primary/50" />
              <p className="text-xs font-medium text-primary/60 mb-3 uppercase tracking-wider">Pairing Code</p>
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-5xl font-bold tracking-[0.2em] text-primary font-mono">{pairingCode}</p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Code expires in 10 minutes</p>
            </div>
            <Button variant="outline" className="w-full rounded-full gap-2" onClick={handleCopy}>
              {copied ? <><Check className="h-4 w-4 text-success" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Code</>}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="screenName">Screen Name</Label>
              <Input id="screenName" placeholder="Lobby Display" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group (optional)</Label>
              <Select value={groupId || "none"} onValueChange={(v) => setGroupId(v === "none" || v === null ? "" : v)}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="No group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit" disabled={loading} className="rounded-full h-10">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Pairing Code"}</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
