"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { MapIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ScreenMapData {
  id: string;
  name: string;
  is_online: boolean;
  screen_type: "static" | "bus" | "auto" | null;
  last_seen: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ScreenLocation {
  screen_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface OverviewMapProps {
  screens: ScreenMapData[];
  locations?: ScreenLocation[];
}

interface ResolvedScreen extends ScreenMapData {
  resolved_lat: number | null;
  resolved_lng: number | null;
}

function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function resolveScreens(
  screens: ScreenMapData[],
  locations: ScreenLocation[]
): ResolvedScreen[] {
  // Build latest-location lookup for mobile screens
  const latestByScreen: Record<string, { latitude: number; longitude: number }> = {};
  for (const loc of locations) {
    const existing = latestByScreen[loc.screen_id];
    if (!existing || new Date(loc.recorded_at) > new Date(existing as any)) {
      latestByScreen[loc.screen_id] = { latitude: loc.latitude, longitude: loc.longitude };
    }
  }

  return screens.map((s) => {
    if (s.screen_type === "static") {
      return { ...s, resolved_lat: s.latitude, resolved_lng: s.longitude };
    }
    const latest = latestByScreen[s.id];
    return {
      ...s,
      resolved_lat: latest?.latitude ?? s.latitude,
      resolved_lng: latest?.longitude ?? s.longitude,
    };
  });
}

function createOnlineIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

function createOfflineIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

function updateMarkers(
  map: any,
  markers: any[],
  screens: ResolvedScreen[],
  L: any,
  onlineIcon: any,
  offlineIcon: any
) {
  // Remove old markers
  for (const m of markers) {
    map.removeLayer(m);
  }
  markers.length = 0;

  for (const screen of screens) {
    if (screen.resolved_lat == null || screen.resolved_lng == null) continue;

    const lat = screen.resolved_lat;
    const lng = screen.resolved_lng;

    const icon = screen.is_online ? onlineIcon : offlineIcon;
    const marker = L.marker([lat, lng], { icon }).addTo(map);

    const lastSeenText = formatLastSeen(screen.last_seen);

    marker.bindPopup(`
      <div style="font-family:system-ui,sans-serif;padding:6px 4px;min-width:180px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:15px;color:#0F1A2E;">${screen.name}</p>
        <div style="margin:0 0 6px;font-size:13px;display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${screen.is_online ? "#22c55e" : "#ef4444"};"></span>
          <span style="color:${screen.is_online ? "#16a34a" : "#dc2626"};font-weight:500;">
            ${screen.is_online ? "Online" : "Offline"}
          </span>
          <span style="margin-left:auto;font-size:11px;color:#9ca3af;text-transform:capitalize;">${screen.screen_type ?? "—"}</span>
        </div>
        <div style="font-size:12px;color:#6b7280;display:flex;justify-content:space-between;border-top:1px solid #f3f4f6;padding-top:6px;">
          <span>Last seen</span>
          <span style="font-weight:500;color:#374151;">${lastSeenText}</span>
        </div>
      </div>
    `);

    markers.push(marker);
  }
}

export function OverviewMap({ screens: initialScreens, locations: initialLocations = [] }: OverviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const leafletRef = useRef<any>(null);
  const onlineIconRef = useRef<any>(null);
  const offlineIconRef = useRef<any>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const initialBoundsFitRef = useRef(false);

  // Live state that gets updated via polling
  const [liveScreens, setLiveScreens] = useState<ScreenMapData[]>(initialScreens);
  const [liveLocations, setLiveLocations] = useState<ScreenLocation[]>(initialLocations);

  // Keep props in sync when they change (SSR → initial render)
  useEffect(() => {
    setLiveScreens(initialScreens);
    setLiveLocations(initialLocations ?? []);
  }, [initialScreens, initialLocations]);

  const resolvedScreens = useMemo(
    () => resolveScreens(liveScreens, liveLocations),
    [liveScreens, liveLocations]
  );

  const screensWithLocation = resolvedScreens.filter(
    (s) => s.resolved_lat != null && s.resolved_lng != null
  );
  const screensWithoutLocation = resolvedScreens.filter(
    (s) => s.resolved_lat == null || s.resolved_lng == null
  );

  const onlineCount = resolvedScreens.filter((s) => s.is_online).length;
  const offlineCount = resolvedScreens.length - onlineCount;

  // ──────────────────────────────────────
  // 1. Map creation — runs ONCE on mount
  // ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    mountedRef.current = true;

    import("leaflet").then((mod) => {
      if (!mountedRef.current) return;
      const L = mod.default || mod;

      // Fix default marker icon path issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      leafletRef.current = L;
      onlineIconRef.current = createOnlineIcon(L);
      offlineIconRef.current = createOfflineIcon(L);

      setTimeout(() => map.invalidateSize(), 200);

      // Initial marker rendering + one-time fitBounds
      const initialResolved = resolveScreens(liveScreens, liveLocations);
      updateMarkers(
        map,
        markersRef.current,
        initialResolved,
        L,
        onlineIconRef.current,
        offlineIconRef.current
      );

      // Fit to markers once on initial load
      const markerBounds: [number, number][] = [];
      for (const s of initialResolved) {
        if (s.resolved_lat != null && s.resolved_lng != null) {
          markerBounds.push([s.resolved_lat, s.resolved_lng]);
        }
      }
      if (markerBounds.length > 0) {
        map.fitBounds(L.latLngBounds(markerBounds), { padding: [40, 40], maxZoom: 15 });
      }
      initialBoundsFitRef.current = true;
    });

    return () => {
      mountedRef.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ──────────────────────────────────────
  // 2. Marker updates — runs when data changes
  // ──────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    updateMarkers(
      map,
      markersRef.current,
      resolvedScreens,
      L,
      onlineIconRef.current,
      offlineIconRef.current
    );
  }, [resolvedScreens]);

  // ──────────────────────────────────────
  // 3. Polling — fetch fresh data every 15s
  // ──────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/screens/live-map");
      if (!res.ok) return;
      const data = await res.json();
      if (!mountedRef.current) return;
      if (data.screens) setLiveScreens(data.screens);
      if (data.locations) setLiveLocations(data.locations);
    } catch {
      // Silently fail — will retry on next poll
    }
  }, []);

  useEffect(() => {
    poll(); // initial fetch to get fresh data
    pollingRef.current = setInterval(poll, 15000);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [poll]);

  // ──────────────────────────────────────
  // 4. Supabase Realtime subscription
  // ──────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("live-map");

    channel
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "screens" },
        () => { poll(); }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "screen_locations" },
        () => { poll(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll]);

  // ──────────────────────────────────────
  // Render
  // ──────────────────────────────────────

  if (resolvedScreens.length === 0) {
    return (
      <SectionCard title="Live Map" subtitle="No screens to display">
        <div className="flex flex-col items-center justify-center h-[380px] rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <MapIcon className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No screens found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Add screens to see them on the live map
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Live Map"
      subtitle={`${resolvedScreens.length} screen${resolvedScreens.length !== 1 ? "s" : ""} — ${onlineCount} online, ${offlineCount} offline`}
      action={
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            Online ({onlineCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
            Offline ({offlineCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />
            No Location ({screensWithoutLocation.length})
          </span>
        </div>
      }
    >
      <div
        ref={mapContainerRef}
        className="h-[380px] w-full rounded-xl overflow-hidden border border-border"
        style={{ zIndex: 0 }}
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </SectionCard>
  );
}
