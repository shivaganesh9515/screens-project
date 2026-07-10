"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  duration_ms: number | null;
}

interface PlaylistItemData {
  id: string;
  media_items: MediaItem | null;
  duration_ms: number | null;
  position: number;
}

interface NowPlayingResponse {
  playlist: { id: string } | null;
  items: PlaylistItemData[];
}

interface PlayLogEntry {
  screen_id: string;
  playlist_id: string;
  media_item_id: string;
  started_at: string;
  ended_at: string;
  duration_ms: number;
}

export default function PlayerPage({ params }: { params: Promise<{ token: string }> }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [paired, setPaired] = useState(false);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState("");
  const [playlist, setPlaylist] = useState<PlaylistItemData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [screenType, setScreenType] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wakeLockRef = useRef<any>(null);
  const hideCursorTimer = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const playLogBuffer = useRef<PlayLogEntry[]>([]);
  const advanceTimer = useRef<NodeJS.Timeout | null>(null);
  const transitionTimer = useRef<NodeJS.Timeout | null>(null);
  const fetchInterval = useRef<NodeJS.Timeout | null>(null);
  const playlistRef = useRef<PlaylistItemData[]>([]);
  const playStartTimeRef = useRef<string>("");
  const gpsWatchIdRef = useRef<number | null>(null);
  const gpsPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const prevIndexRef = useRef<number | null>(null);
  const videoEndedRef = useRef(false);

  useEffect(() => { playlistRef.current = playlist; }, [playlist]);

  // Restore paired state
  useEffect(() => {
    const storedId = localStorage.getItem("screen_id");
    const storedType = localStorage.getItem("screen_type");
    if (storedId) {
      setScreenId(storedId);
      if (storedType) setScreenType(storedType);
      setPaired(true);
    }
  }, []);

  // Register service worker for offline support
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Kiosk mode
  useEffect(() => {
    const enterFullscreen = async () => { try { await document.documentElement.requestFullscreen(); } catch {} };
    const requestWakeLock = async () => { try { if ("wakeLock" in navigator) wakeLockRef.current = await (navigator as any).wakeLock.request("screen"); } catch {} };
    const handleVisibility = () => { if (document.visibilityState === "visible") requestWakeLock(); };
    const handleMouseMove = () => { document.body.style.cursor = "default"; if (hideCursorTimer.current) clearTimeout(hideCursorTimer.current); hideCursorTimer.current = setTimeout(() => { document.body.style.cursor = "none"; }, 3000); };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "F11" || (e.ctrlKey && e.key === "w") || (e.ctrlKey && e.key === "q")) e.preventDefault(); };
    enterFullscreen(); requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      if (hideCursorTimer.current) clearTimeout(hideCursorTimer.current);
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  // Pair screen: send pairing code to backend, receive screen_id
  const handlePair = async () => {
    if (code.length !== 6) return;
    setPairing(true);
    setPairError("");
    try {
      const res = await fetch(`/api/screens/pair/${code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        setPairError(err.error || "Pairing failed");
        setPairing(false);
        return;
      }
      const data = await res.json();
      const sid = data.screen.id;
      const stype = data.screen.screen_type;
      localStorage.setItem("screen_id", sid);
      if (stype) localStorage.setItem("screen_type", stype);
      setScreenId(sid);
      setScreenType(stype);
      setPaired(true);
    } catch {
      setPairError("Connection failed");
    }
    setPairing(false);
  };

  // Fetch current schedule
  const fetchNowPlaying = useCallback(async () => {
    if (!screenId) return;
    try {
      const res = await fetch(`/api/screens/${screenId}/schedule`);
      if (!res.ok) return;
      const data: NowPlayingResponse = await res.json();
      if (data.playlist?.id && data.playlist.id !== activePlaylistId) {
        setPlaylist(data.items);
        setPlaylistId(data.playlist.id);
        setActivePlaylistId(data.playlist.id);
        setCurrentIndex(0);
        setPrevIndex(null);
        setTransitioning(false);
      } else if (!data.playlist) {
        setPlaylist([]);
        setActivePlaylistId(null);
      }
    } catch {}
  }, [screenId, activePlaylistId]);

  useEffect(() => {
    if (!paired || !screenId) return;
    fetchNowPlaying();
    fetchInterval.current = setInterval(fetchNowPlaying, 60000);
    return () => { if (fetchInterval.current) clearInterval(fetchInterval.current); };
  }, [paired, screenId, fetchNowPlaying]);

  // Realtime subscription for schedule updates
  useEffect(() => {
    if (!paired || !screenId) return;
    const supabase = createClient();
    const channel = supabase.channel(`screen:${screenId}`);
    channel.on("broadcast", { event: "schedule_update" }, () => {
      fetchNowPlaying();
    });
    channel.subscribe();
    return () => { channel.unsubscribe(); };
  }, [paired, screenId, fetchNowPlaying]);

  // Advance to next item, loop at end — no external deps needed (uses refs)
  const advance = useCallback(() => {
    // Store the current index (from ref) before advancing
    const current = currentIndexRef.current;
    prevIndexRef.current = current;
    setPrevIndex(current);
    setTransitioning(true);
    videoEndedRef.current = false;

    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= playlistRef.current.length) return 0;
      return next;
    });

    // Clear transition state after animation completes with safety margin
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setTransitioning(false);
      setPrevIndex(null);
      prevIndexRef.current = null;
    }, 600);
  }, []);

  // Keep a ref in sync with currentIndex for use in advance()
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // Log play with correct schema field names
  const logPlay = useCallback((mediaItemId: string, durationMs: number) => {
    if (!screenId || !playlistId) return;
    const now = new Date().toISOString();
    playLogBuffer.current.push({
      screen_id: screenId,
      playlist_id: playlistId,
      media_item_id: mediaItemId,
      started_at: playStartTimeRef.current || now,
      ended_at: now,
      duration_ms: durationMs,
    });
  }, [screenId, playlistId]);

  // Heartbeat + flush play logs + send GPS
  const sendHeartbeat = useCallback(async () => {
    if (!screenId) return;
    const payload: Record<string, any> = { screen_id: screenId };

    // Include GPS position if available (bus/auto screens)
    const gpsPos = gpsPositionRef.current;
    if (gpsPos) {
      payload.latitude = gpsPos.latitude;
      payload.longitude = gpsPos.longitude;
    }

    try {
      const res = await fetch("/api/screens/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setOffline(!res.ok);
      if (playLogBuffer.current.length > 0) {
        await fetch("/api/play-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playLogBuffer.current),
        });
        playLogBuffer.current = [];
      }
    } catch { setOffline(true); }
  }, [screenId]);

  // Start GPS tracking for bus/auto screens
  useEffect(() => {
    if (!paired || !screenId || !screenType) return;

    // Only track GPS for mobile screens (bus / auto)
    const isMobile = screenType === "bus" || screenType === "auto";
    if (!isMobile) return;

    // Check if geolocation is available
    if (!("geolocation" in navigator)) {
      console.log("[Player] Geolocation not available — skipping GPS");
      return;
    }

    // Start watching position
    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        gpsPositionRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      },
      (error) => {
        console.warn("[Player] GPS error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );

    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      gpsPositionRef.current = null;
    };
  }, [paired, screenId, screenType]);

  useEffect(() => {
    if (!paired || !screenId) return;
    sendHeartbeat();
    heartbeatInterval.current = setInterval(sendHeartbeat, 30000);
    return () => { if (heartbeatInterval.current) clearInterval(heartbeatInterval.current); };
  }, [paired, screenId, sendHeartbeat]);

  // Playback engine: render images and video
  useEffect(() => {
    if (playlist.length === 0) return;
    const item = playlist[currentIndex];
    if (!item || !item.media_items) {
      advance();
      return;
    }
    const media = item.media_items;
    const duration = item.duration_ms ?? media.duration_ms ?? 10000;
    playStartTimeRef.current = new Date().toISOString();

    if (media.type === "video") {
      const video = videoRef.current;
      if (!video) return;
      video.src = media.url;
      video.load();
      video.play().catch(() => {});
      videoEndedRef.current = false;
      const onEnded = () => {
        if (videoEndedRef.current) return;
        videoEndedRef.current = true;
        logPlay(media.id, duration);
        advance();
      };
      video.addEventListener("ended", onEnded);
      // Fallback: use duration as max timeout, cap at 60s
      const maxPlayTime = Math.min(Math.max(duration, 30000), 60000);
      advanceTimer.current = setTimeout(() => {
        if (!videoEndedRef.current) {
          videoEndedRef.current = true;
          video.removeEventListener("ended", onEnded);
          logPlay(media.id, duration);
          advance();
        }
      }, maxPlayTime);
      return () => {
        video.removeEventListener("ended", onEnded);
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        video.pause();
        video.src = "";
      };
    } else {
      advanceTimer.current = setTimeout(() => {
        logPlay(media.id, duration);
        advance();
      }, duration);
      return () => {
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
      };
    }
  }, [currentIndex, playlist, advance, logPlay]);

  // Cleanup transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  // --- Render ---

  // Unpaired: show code entry form
  if (!paired) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-sidebar via-[#0f1729] to-[#1a1f35]">
        <div className="text-center max-w-lg">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Pair Your Screen</h1>
          <p className="mb-10 text-sm text-sidebar-foreground">Enter the pairing code from your dashboard</p>
          <div className="mx-auto mb-6 max-w-xs">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-4xl font-bold tracking-[0.2em] py-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={6}
              disabled={pairing}
              autoFocus
            />
          </div>
          <div className="mx-auto mb-4 max-w-xs">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Device name (optional)"
              className="w-full text-center text-sm py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={pairing}
              maxLength={64}
            />
          </div>
          {pairError && <p className="mb-4 text-sm text-red-400">{pairError}</p>}
          <button
            onClick={handlePair}
            disabled={code.length !== 6 || pairing}
            className="rounded-full bg-primary px-10 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-primary-dark transition-colors"
          >
            {pairing ? "Connecting..." : "Pair Screen"}
          </button>
        </div>
      </div>
    );
  }

  // Paired but no content
  if (playlist.length === 0) {
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

  // Playing: render real media with crossfade
  const currentItem = playlist[currentIndex]?.media_items;
  const prevItem = prevIndex !== null ? playlist[prevIndex]?.media_items : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      {/* Previous item fading out */}
      {prevItem && (
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          {prevItem.type === "video" ? (
            <video
              key={`prev-${prevItem.id}`}
              className="h-full w-full object-contain"
              muted
              playsInline
              src={prevItem.url}
            />
          ) : (
            <img
              key={`prev-${prevItem.id}`}
              src={prevItem.url}
              alt={prevItem.name}
              className="h-full w-full object-contain"
            />
          )}
        </div>
      )}
      {/* Current item fading in */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: prevItem ? (transitioning ? 1 : 0) : 1,
        }}
      >
        {currentItem?.type === "video" ? (
          <video
            ref={videoRef}
            key={currentItem.id}
            className="h-full w-full object-contain"
            muted
            playsInline
          />
        ) : (
          currentItem?.type === "image" && (
            <img
              key={currentItem.id}
              src={currentItem.url}
              alt={currentItem.name}
              className="h-full w-full object-contain"
            />
          )
        )}
      </div>
      {/* Playback progress indicator */}
      {playlist.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {playlist.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 bg-white/90"
                  : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
      {/* Screen status badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {offline ? (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Offline
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Live
          </span>
        )}
        {screenType && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 capitalize">
            {screenType}
          </span>
        )}
      </div>
    </div>
  );
}
