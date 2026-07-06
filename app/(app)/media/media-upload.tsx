"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Loader2, FileType, X, Check } from "lucide-react";

function detectImageOrientation(file: File): Promise<"portrait" | "landscape" | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const orientation = img.width > img.height ? "landscape" : "portrait";
      URL.revokeObjectURL(url);
      resolve(orientation);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

function detectVideoOrientation(file: File): Promise<"portrait" | "landscape" | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const orientation = video.videoWidth > video.videoHeight ? "landscape" : "portrait";
      URL.revokeObjectURL(url);
      resolve(orientation);
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    video.src = url;
  });
}

async function detectOrientation(file: File): Promise<"portrait" | "landscape" | null> {
  try {
    if (file.type.startsWith("video/")) return await detectVideoOrientation(file);
    if (file.type.startsWith("image/")) return await detectImageOrientation(file);
    return null;
  } catch {
    return null;
  }
}

export function MediaUpload({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [folder, setFolder] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [fileOrientations, setFileOrientations] = useState<Record<string, "portrait" | "landscape">>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach(async (file) => {
      const orientation = await detectOrientation(file);
      if (orientation) {
        setFileOrientations((prev) => ({ ...prev, [file.name]: orientation }));
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const droppedFiles = e.dataTransfer.files; if (droppedFiles) { const fileArray = Array.from(droppedFiles).filter((f) => f.type.startsWith("image/") || f.type === "video/mp4" || f.type === "video/webm"); addFiles(fileArray); } };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const selectedFiles = e.target.files; if (selectedFiles) addFiles(Array.from(selectedFiles)); };
  const removeFile = (index: number) => {
    const file = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileOrientations((prev) => { const next = { ...prev }; delete next[file.name]; return next; });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));
      const fileExt = file.name.split(".").pop();
      const filePath = `${orgId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const type = file.type.startsWith("video") ? "video" : "image";
      let thumbnailPath: string | null = null;
      if (type === "video") {
        try {
          const video = document.createElement("video"); video.src = URL.createObjectURL(file);
          await new Promise((resolve) => { video.onloadeddata = () => { video.currentTime = 0; setTimeout(resolve, 200); }; });
          const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/webp", 80));
          const thumbPath = `${orgId}/thumb_${Date.now()}.webp`;
          const { error: thumbError } = await supabase.storage.from("media").upload(thumbPath, blob, { contentType: "image/webp" });
          if (!thumbError) thumbnailPath = thumbPath; URL.revokeObjectURL(video.src);
        } catch {}
      }
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file, { cacheControl: "3600" });
      if (uploadError) { toast.error(`Failed to upload ${file.name}`); setProgress((prev) => ({ ...prev, [file.name]: -1 })); continue; }
      let durationMs: number | null = null;
      if (type === "video") { const video = document.createElement("video"); video.src = URL.createObjectURL(file); await new Promise((resolve) => { video.onloadedmetadata = () => { durationMs = Math.round(video.duration * 1000); resolve(null); }; }); URL.revokeObjectURL(video.src); }
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const { error: dbError } = await supabase.from("media_items").insert({ org_id: orgId, name: file.name, type, storage_path: filePath, thumbnail_path: thumbnailPath, duration_ms: durationMs, size_bytes: file.size, folder: folder || null, tags: tags.length > 0 ? tags : null, orientation: fileOrientations[file.name] || null });
      if (dbError) toast.error(`Failed to save ${file.name}`);
      else setProgress((prev) => ({ ...prev, [file.name]: 100 }));
    }
    setUploading(false); toast.success(`${files.length} file(s) uploaded`); setFiles([]); setFolder(""); setTagsInput(""); setFileOrientations({}); setOpen(false); router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger><Button className="rounded-xl gap-2 h-10 shadow-sm" type="button"><Upload className="h-4 w-4" /> Upload Media</Button></DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-2xl shadow-card-elevated">
        <DialogHeader><DialogTitle>Upload Media</DialogTitle><DialogDescription>Drag and drop files or click to browse. Supports JPG, PNG, GIF, WebP, and MP4.</DialogDescription></DialogHeader>
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
                <div className="flex items-center gap-2">
                  {fileOrientations[file.name] && !uploading && (
                    <Select value={fileOrientations[file.name]} onValueChange={(v) => setFileOrientations((prev) => ({ ...prev, [file.name]: v as "portrait" | "landscape" }))}>
                      <SelectTrigger className="h-7 w-[90px] text-xs rounded-lg border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait" className="text-xs">Portrait</SelectItem>
                        <SelectItem value="landscape" className="text-xs">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {progress[file.name] === 100 ? <Check className="h-5 w-5 text-success shrink-0" /> : progress[file.name] === -1 ? <X className="h-5 w-5 text-destructive shrink-0" /> : !uploading && <Button variant="ghost" size="sm" onClick={() => removeFile(i)}><X className="h-4 w-4" /></Button>}
                </div>
              </div>
            ))}
          </div>
        )}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="folder" className="text-sm font-medium">Folder</Label>
              <Input id="folder" placeholder="e.g. marketing, lobby" value={folder} onChange={(e) => setFolder(e.target.value)} className="h-10 rounded-xl border-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
              <Input id="tags" placeholder="e.g. marketing, lobby, promo" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="h-10 rounded-xl border-border" />
              <p className="text-xs text-muted-foreground">Comma-separated values</p>
            </div>
          </div>
        )}
        {files.length > 0 && <Button onClick={handleUpload} disabled={uploading} className="w-full rounded-full gap-2">{uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload {files.length} file(s)</>}</Button>}
      </DialogContent>
    </Dialog>
  );
}
