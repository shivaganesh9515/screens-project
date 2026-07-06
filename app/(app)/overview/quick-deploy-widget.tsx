"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, ArrowDownUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Playlist {
  id: string;
  name: string;
}

interface Screen {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface QuickDeployWidgetProps {
  playlists: Playlist[];
  screens: Screen[];
  groups: Group[];
}

export function QuickDeployWidget({ playlists, screens, groups }: QuickDeployWidgetProps) {
  const [playlist, setPlaylist] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [pushing, setPushing] = useState(false);
  const supabase = createClient();

  const handlePush = async () => {
    if (!playlist || !target) {
      toast.error("Please select both content and target");
      return;
    }
    setPushing(true);

    // Get current org_id from user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setPushing(false);
      return;
    }

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      toast.error("No org found");
      setPushing(false);
      return;
    }

    // Parse target: "screen-xxx" or "group-xxx"
    const isGroup = target.startsWith("group-");
    const targetId = target.replace(isGroup ? "group-" : "screen-", "");

    const scheduleRow: Record<string, any> = {
      org_id: member.org_id,
      playlist_id: playlist,
      is_default: true,
      priority: 0,
    };

    if (isGroup) {
      scheduleRow.group_id = targetId;
    } else {
      scheduleRow.screen_id = targetId;
    }

    const { error } = await supabase.from("schedules").insert(scheduleRow);

    if (error) {
      toast.error("Failed to push content: " + error.message);
    } else {
      toast.success("Content pushed to screen(s)");
      setPlaylist("");
      setTarget("");
    }
    setPushing(false);
  };

  return (
    <SectionCard title="Quick Deploy" subtitle="Push content to screens">
      <div className="space-y-5">
        {/* Block A — Content */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Content
          </label>
          <Select value={playlist} onValueChange={(v) => v && setPlaylist(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select playlist..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {playlists.length === 0 && (
                  <SelectItem value="__none__" disabled>
                    No playlists available
                  </SelectItem>
                )}
                {playlists.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Separator arrow */}
        <div className="flex justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Block B — Target */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Target
          </label>
          <Select value={target} onValueChange={(v) => v && setTarget(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select screen or group..." />
            </SelectTrigger>
            <SelectContent>
              {screens.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Screens</SelectLabel>
                  {screens.map((s) => (
                    <SelectItem key={`screen-${s.id}`} value={`screen-${s.id}`}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {groups.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Groups</SelectLabel>
                  {groups.map((g) => (
                    <SelectItem key={`group-${g.id}`} value={`group-${g.id}`}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {screens.length === 0 && groups.length === 0 && (
                <SelectGroup>
                  <SelectItem value="__none__" disabled>
                    No screens or groups available
                  </SelectItem>
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* CTA */}
        <Button className="w-full gap-2" onClick={handlePush} disabled={pushing}>
          <Send className="h-4 w-4" />
          {pushing ? "Pushing..." : "Push to Screen"}
        </Button>
      </div>
    </SectionCard>
  );
}
