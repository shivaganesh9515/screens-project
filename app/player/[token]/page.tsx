"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Monitor, Wifi, WifiOff } from "lucide-react";

interface PlaylistItem { id: string; media_items: { id: string; name: string; type: string; storage_path: string; duration_ms: number | null; }; duration_ms: number; }
interface PlayerState { paired: boolean; screenId: string | null; pairingCode: string | null; playlist: PlaylistItem[]; currentIndex: number; playing: boolean; }

export default function PlayerPage({ params }: { params: Promise<{ token: string }> }) {
  const [state, setState] = useState<PlayerState>({ paired: false, screenId: null, pairingCode: null, playlist: [], currentIndex: 0, playing: false });
  const videoRef = useRef<HTMLVideoElement>(null);
  const wakeLockRef = useRef<any>(null);
  const hideCursorTimer = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const screenId = localStorage.getItem("screen_id");
    if (screenId) setState((prev) => ({ ...prev, paired: true, screenId }));
    else { const code = Math.random().toString(36).substring(2, 8).toUpperCase(); setState((prev) => ({ ...prev, pairingCode: code })); }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (!state.screenId) return;
    try { await fetch("/api/screens/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ screen_id: state.screenId }) }); } catch {}
  }, [state.screenId]);

  useEffect(() => {
    if (state.paired && state.screenId) { heartbeatInterval.current = setInterval(sendHeartbeat, 30000); return () => { if (heartbeatInterval.current) clearInterval(heartbeatInterval.current); }; }
  }, [state.paired, state.screenId, sendHeartbeat]);

  useEffect(() => {
    const enterFullscreen = async () => { try { await document.documentElement.requestFullscreen(); } catch {} };
    const requestWakeLock = async () => { try { if ("wakeLock" in navigator) wakeLockRef.current = await (navigator as any).wakeLock.request("screen"); } catch {} };
    const handleVisibility = () => { if (document.visibilityState === "visible") requestWakeLock(); };
    const handleMouseMove = () => { document.body.style.cursor = "default"; if (hideCursorTimer.current) clearTimeout(hideCursorTimer.current); hideCursorTimer.current = setTimeout(() => { document.body.style.cursor = "none"; }, 3000); };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "F11" || (e.ctrlKey && e.key === "w") || (e.ctrlKey && e.key === "q")) e.preventDefault(); };
    enterFullscreen(); requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibility); document.addEventListener("mousemove", handleMouseMove); document.addEventListener("contextmenu", handleContextMenu); document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("visibilitychange", handleVisibility); document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("contextmenu", handleContextMenu); document.removeEventListener("keydown", handleKeyDown); if (hideCursorTimer.current) clearTimeout(hideCursorTimer.current); if (wakeLockRef.current) wakeLockRef.current.release(); };
  }, []);

  useEffect(() => { if (state.paired) setState((prev) => ({ ...prev, playing: true })); }, [state.paired]);

  if (!state.paired) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-sidebar via-[#0f1729] to-[#1a1f35]">
        <div className="text-center max-w-lg">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Pair Your Screen</h1>
          <p className="mb-10 text-sm text-sidebar-foreground">Enter this code in your dashboard to register this screen</p>
          <div className="mx-auto mb-6 inline-block rounded-2xl bg-white/5 border border-white/10 px-14 py-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground">Pairing Code</p>
            <p className="text-7xl font-bold tracking-[0.15em] text-white">{state.pairingCode}</p>
          </div>
          <p className="text-sm text-sidebar-foreground/60">Code expires in 10 minutes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-sidebar via-[#0f1729] to-[#1a1f35]">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20">
          <Monitor className="h-8 w-8 text-white" />
        </div>
        <p className="text-3xl font-bold text-white">Screens</p>
        <p className="mt-3 text-lg text-sidebar-foreground">Waiting for content...</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="flex h-3 w-3 items-center justify-center">
            <span className="h-3 w-3 animate-ping rounded-full bg-green-500 opacity-75 absolute" />
            <span className="h-2 w-2 rounded-full bg-green-500 relative" />
          </span>
          <span className="text-sm font-medium text-green-400">Connected</span>
        </div>
      </div>
    </div>
  );
}
