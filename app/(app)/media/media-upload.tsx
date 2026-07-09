"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, Loader2, FileType, X, Check, Link, Maximize2, Film } from "lucide-react";

export function MediaUpload({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<"file" | "link">("file");
  const [folder, setFolder] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [uploadMode, setUploadMode] = useState<"file" | "link">("file");
  const [liveUrl, setLiveUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const droppedFiles = e.dataTransfer.files; if (droppedFiles) { const fileArray = Array.from(droppedFiles).filter((f) => f.type.startsWith("image/") || f.type === "video/mp4" || f.type === "video/webm"); setFiles((prev) => [...prev, ...fileArray]); } };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const selectedFiles = e.target.files; if (selectedFiles) setFiles((prev) => [...prev, ...Array.from(selectedFiles)]); };
  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (uploadMode === "link") {
      if (!liveUrl.trim()) {
        toast.error("Live video URL is required");
        return;
      }
      setUploading(true);
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const { error: dbError } = await supabase.from("media_items").insert({
        org_id: orgId,
        name: liveUrl.split("/").pop() || "Live Stream",
        type: "video",
        storage_path: null,
        thumbnail_path: null,
        duration_ms: null,
        size_bytes: null,
        folder: folder || null,
        tags: tags.length > 0 ? tags : null,
        orientation,
        source_type: "link",
        external_url: liveUrl.trim(),
      });
      if (dbError) toast.error("Failed to save live link");
      else toast.success("Live link added");
      setUploading(false);
      setLiveUrl("");
      setFolder("");
      setTagsInput("");
      setOrientation("landscape");
      setUploadMode("file");
      setOpen(false);
      router.refresh();
      return;
    }

    if (files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));
      const fileExt = file.name.split(".").pop();
      const filePath = `${orgId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const type = file.type.startsWith("video") ? "video" : "image";
      let orientation: string | null = null;
      let thumbnailPath: string | null = null;
      if (type === "video") {
        try {
          const video = document.createElement("video"); video.src = URL.createObjectURL(file);
          await new Promise((resolve) => { video.onloadeddata = () => { video.currentTime = 0; setTimeout(resolve, 200); }; });
          orientation = video.videoWidth >= video.videoHeight ? "landscape" : "portrait";
          const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/webp", 80));
          const thumbPath = `${orgId}/thumb_${Date.now()}.webp`;
          const { error: thumbError } = await supabase.storage.from("media").upload(thumbPath, blob, { contentType: "image/webp" });
          if (!thumbError) thumbnailPath = thumbPath; URL.revokeObjectURL(video.src);
        } catch {}
      } else {
        try {
          const img = new Image(); img.src = URL.createObjectURL(file);
          await new Promise((resolve) => { img.onload = resolve; });
          orientation = img.naturalWidth >= img.naturalHeight ? "landscape" : "portrait";
          URL.revokeObjectURL(img.src);
        } catch {}
      }
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file, { cacheControl: "3600" });
      if (uploadError) { toast.error(`Failed to upload ${file.name}`); setProgress((prev) => ({ ...prev, [file.name]: -1 })); continue; }
      let durationMs: number | null = null;
      if (type === "video") { const video = document.createElement("video"); video.src = URL.createObjectURL(file); await new Promise((resolve) => { video.onloadedmetadata = () => { durationMs = Math.round(video.duration * 1000); resolve(null); }; }); URL.revokeObjectURL(video.src); }
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const { error: dbError } = await supabase.from("media_items").insert({
        org_id: orgId, name: file.name, type, storage_path: filePath,
        thumbnail_path: thumbnailPath, duration_ms: durationMs, size_bytes: file.size,
        folder: folder || null, tags: tags.length > 0 ? tags : null,
        orientation, source_type: "upload", external_url: null,
      });
      if (dbError) toast.error(`Failed to save ${file.name}`);
      else setProgress((prev) => ({ ...prev, [file.name]: 100 }));
    }
    setUploading(false); toast.success(`${files.length} file(s) uploaded`); setFiles([]); setFolder(""); setTagsInput(""); setOrientation("landscape"); setUploadMode("file"); setOpen(false); router.refresh();
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) { toast.error("Please enter a video URL"); return; }
    if (!linkName.trim()) { toast.error("Please enter a name"); return; }
    setUploading(true);
    const { error } = await supabase.from("media_items").insert({
      org_id: orgId,
      name: linkName.trim(),
      type: "video",
      source_type: "link",
      external_url: linkUrl.trim(),
      folder: folder || null,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean).length > 0
        ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
    });
    if (error) { toast.error("Failed to add link"); setUploading(false); return; }
    toast.success("Live video link added"); setLinkUrl(""); setLinkName(""); setFolder(""); setTagsInput(""); setOpen(false); setUploading(false); router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-xl gap-2 h-10 shadow-sm" type="button"><Upload className="h-4 w-4" /> Upload Media</Button>} />
      <DialogContent className="sm:max-w-xl rounded-2xl shadow-card-elevated">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>Upload a file or add a live video link. Supports JPG, PNG, GIF, WebP, and MP4.</DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {[
            { key: "file" as const, label: "Upload File", icon: FileType },
            { key: "link" as const, label: "Live Video Link", icon: Link },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setUploadMode(opt.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                uploadMode === opt.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>

        {uploadMode === "link" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-primary" />
                Live Video URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="liveUrl"
                type="url"
                placeholder="https://example.com/stream.m3u8"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Enter the HLS or MPEG-DASH streaming URL for the live video feed
              </p>
            </div>
          </div>
        ) : (
          <>
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="group cursor-pointer rounded-2xl border-2 border-dashed border-border bg-muted/30 p-14 text-center transition-all hover:border-primary/40 hover:bg-primary-muted/50 active:scale-[0.99]">
              <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Drop files here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Max file size: 500MB per file</p>
              <Input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4,video/webm" className="hidden" onChange={handleFileSelect} />
            </div>
            {files.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileType className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div>
                    </div>
                    {progress[file.name] === 100 ? <Check className="h-5 w-5 text-success shrink-0" /> : progress[file.name] === -1 ? <X className="h-5 w-5 text-destructive shrink-0" /> : !uploading && <Button variant="ghost" size="sm" onClick={() => removeFile(i)}><X className="h-4 w-4" /></Button>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

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

        {/* Link-specific fields */}
        {uploadMode === "link" && (files.length > 0 || uploadMode === "link") && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="linkName" className="text-sm font-medium">Name</Label>
              <Input id="linkName" placeholder="e.g. Beach Cam - Live" value={linkName} onChange={(e) => setLinkName(e.target.value)} className="h-10 rounded-xl border-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkUrl" className="text-sm font-medium">Video URL</Label>
              <Input id="linkUrl" placeholder="https://example.com/live-stream.m3u8" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="h-10 rounded-xl border-border" />
              <p className="text-xs text-muted-foreground">Paste a direct link to a live video stream (HLS, RTMP, etc.)</p>
            </div>
            <Button onClick={handleAddLink} disabled={uploading} className="w-full rounded-full gap-2">{uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : <><Link className="h-4 w-4" /> Add Live Video</>}</Button>
          </div>
        )}

        {/* Shared metadata — folder & tags */}
        {(files.length > 0 || uploadMode === "link") && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="folderInput" className="text-sm font-medium">Folder</Label>
              <Input id="folderInput" placeholder="e.g. marketing, lobby" value={folder} onChange={(e) => setFolder(e.target.value)} className="h-10 rounded-xl border-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagsInput" className="text-sm font-medium">Tags</Label>
              <Input id="tagsInput" placeholder="e.g. live, promo" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="h-10 rounded-xl border-border" />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>
          </div>
        )}

        {(files.length > 0 || uploadMode === "link") && (
          <Button onClick={handleUpload} disabled={uploading} className="w-full rounded-full gap-2">
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> {uploadMode === "link" ? "Add Live Link" : `Upload ${files.length} file(s)`}</>}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
