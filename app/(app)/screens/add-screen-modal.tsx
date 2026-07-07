"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, MonitorSmartphone, CheckCircle, Wifi, Smartphone, MapPin, Maximize2 } from "lucide-react";

interface Group { id: string; name: string; }
interface Franchise { id: string; name: string; }

export function AddScreenModal({ groups, franchises, orgId }: { groups: Group[]; franchises: Franchise[]; orgId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uniqueNumber, setUniqueNumber] = useState("");
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [franchiseId, setFranchiseId] = useState("");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [sizeType, setSizeType] = useState("");
  const [screenType, setScreenType] = useState<"static" | "bus" | "auto">("static");
  const [connectivityType, setConnectivityType] = useState<"sim" | "wifi">("wifi");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const showLocation = screenType === "static";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniqueNumber.trim()) {
      toast.error("Unique number is required");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("screens").insert({
        org_id: orgId,
        unique_number: uniqueNumber.trim().toUpperCase(),
        name: name.trim() || `Screen ${uniqueNumber.trim()}`,
        group_id: groupId || null,
        orientation,
        size_type: sizeType || null,
        screen_type: screenType,
        connectivity_type: connectivityType,
        franchise_id: franchiseId || null,
        ...(showLocation && lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {}),
        tags: [],
        is_online: false,
      });

      if (error) {
        if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
          toast.error("This unique number is already registered to another screen");
        } else {
          toast.error(error.message ?? "Failed to register screen");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Failed to register screen");
    }
    setLoading(false);
  };

  const screenTypes = [
    { value: "static" as const, label: "Static", description: "Fixed location" },
    { value: "bus" as const, label: "Bus", description: "Vehicle-mounted" },
    { value: "auto" as const, label: "Auto", description: "Vehicle-mounted" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl gap-2 h-10 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Screen
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-card-elevated p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold">
            {success ? "Screen Registered" : "Register Screen"}
          </DialogTitle>
          <DialogDescription>
            {success
              ? "Screen has been registered successfully. It will appear online once the player connects."
              : "Enter the screen's unique number and details to register it."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-5 px-6 pb-6">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
              <p className="text-xs font-medium text-emerald-600/60 mb-2 uppercase tracking-wider">Registration Complete</p>
              <p className="text-lg font-semibold text-emerald-800">{uniqueNumber.toUpperCase()}</p>
              <p className="mt-2 text-sm text-emerald-600/70">
                The screen is now registered. Once the player connects using this unique number, it will appear online.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
            {/* Unique Number */}
            <div className="space-y-2">
              <Label htmlFor="uniqueNumber" className="flex items-center gap-1.5">
                <MonitorSmartphone className="h-3.5 w-3.5 text-primary" />
                Unique Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uniqueNumber"
                placeholder="e.g. SCR-001"
                value={uniqueNumber}
                onChange={(e) => setUniqueNumber(e.target.value.toUpperCase())}
                required
                className="h-11 rounded-xl font-mono tracking-wider"
              />
              <p className="text-xs text-muted-foreground">
                Enter the pre-printed unique number from the screen device
              </p>
            </div>

            {/* Screen Name */}
            <div className="space-y-2">
              <Label htmlFor="screenName">Screen Name</Label>
              <Input
                id="screenName"
                placeholder="Lobby Display (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <Label>Orientation</Label>
              <ToggleGroup value={[orientation]} onValueChange={(v) => v && v[0] && setOrientation(v[0] as "landscape" | "portrait")} className="gap-2">
                <ToggleGroupItem value="landscape" className={cn("flex-1 rounded-xl h-10 gap-2", orientation === "landscape" && "bg-primary text-primary-foreground")}>
                  <Maximize2 className="h-4 w-4 rotate-0" /> Landscape
                </ToggleGroupItem>
                <ToggleGroupItem value="portrait" className={cn("flex-1 rounded-xl h-10 gap-2", orientation === "portrait" && "bg-primary text-primary-foreground")}>
                  <Maximize2 className="h-4 w-4 rotate-90" /> Portrait
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Size Type */}
            <div className="space-y-2">
              <Label htmlFor="sizeType">Screen Size</Label>
              <Select value={sizeType} onValueChange={(v) => setSizeType(v ?? "")}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="32in">32 inch</SelectItem>
                  <SelectItem value="43in">43 inch</SelectItem>
                  <SelectItem value="55in">55 inch</SelectItem>
                  <SelectItem value="65in">65 inch</SelectItem>
                  <SelectItem value="75in">75 inch</SelectItem>
                  <SelectItem value="86in">86 inch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Screen Type */}
            <div className="space-y-2">
              <Label>Screen Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {screenTypes.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => {
                      setScreenType(st.value);
                      if (st.value !== "static") {
                        setLat("");
                        setLng("");
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center",
                      screenType === st.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MonitorSmartphone className={cn("h-5 w-5", st.value !== "static" && "rotate-45")} />
                    <span className="text-xs font-medium">{st.label}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground/60">{st.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connectivity Type */}
            <div className="space-y-2">
              <Label>Connectivity</Label>
              <ToggleGroup value={[connectivityType]} onValueChange={(v) => v && v[0] && setConnectivityType(v[0] as "sim" | "wifi")} className="gap-2">
                <ToggleGroupItem value="wifi" className={cn("flex-1 rounded-xl h-10 gap-2", connectivityType === "wifi" && "bg-primary text-primary-foreground")}>
                  <Wifi className="h-4 w-4" /> WiFi
                </ToggleGroupItem>
                <ToggleGroupItem value="sim" className={cn("flex-1 rounded-xl h-10 gap-2", connectivityType === "sim" && "bg-primary text-primary-foreground")}>
                  <Smartphone className="h-4 w-4" /> SIM (4G/5G)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Location (for static screens only) */}
            {showLocation && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Location</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" type="number" step="any" placeholder="17.3850" value={lat} onChange={(e) => setLat(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude</Label>
                    <Input id="lng" type="number" step="any" placeholder="78.4867" value={lng} onChange={(e) => setLng(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Franchise */}
            <div className="space-y-2">
              <Label htmlFor="franchise">Franchise Territory (optional)</Label>
              <Select value={franchiseId || "none"} onValueChange={(v) => setFranchiseId(v === "none" || v === null ? "" : v)}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="No franchise" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No franchise</SelectItem>
                  {franchises.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign this screen to a franchise territory for scoped management
              </p>
            </div>

            {/* Group */}
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

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={loading} className="rounded-full h-10">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Register Screen"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
