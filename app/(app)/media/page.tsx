import { createClient } from "@/lib/supabase/server";
import { MediaGrid } from "./media-grid";
import { MediaUpload } from "./media-upload";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  const folders = [...new Set((mediaItems ?? []).map((m: any) => m.folder).filter(Boolean))] as string[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Media Library</h2>
          <p className="text-sm text-muted-foreground">Upload and manage your media files</p>
        </div>
        <MediaUpload orgId={member.org_id} />
      </div>

      <MediaGrid mediaItems={mediaItems ?? []} folders={folders} orgId={member.org_id} />
    </div>
  );
}
