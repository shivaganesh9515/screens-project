"use client";

import { useEffect, useRef, useMemo } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { MapIcon } from "lucide-react";

interface ScreenMapData {
  id: string;
  name: string;
  is_online: boolean;
  screen_type: "static" | "bus" | "auto" | null;
  last_seen: string | null;
  /** Static screen coordinates (used when screen_type is 'static') */
  latitude: number | null;
  longitude: number | null;
  /** Resolved coordinates after applying mobile-location fallback */
  resolved_lat?: number | null;
  resolved_lng?: number | null;
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

export function OverviewMap({ screens, locations = [] }: OverviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Resolve final coordinates for each screen
  const resolvedScreens = useMemo(() => {
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
      // bus / auto — use latest from screen_locations
      const latest = latestByScreen[s.id];
      return {
        ...s,
        resolved_lat: latest?.latitude ?? s.latitude,
        resolved_lng: latest?.longitude ?? s.longitude,
      };
    });
  }, [screens, locations]);

  const screensWithLocation = resolvedScreens.filter(
    (s) => s.resolved_lat != null && s.resolved_lng != null
  );
  const screensWithoutLocation = resolvedScreens.filter(
    (s) => s.resolved_lat == null || s.resolved_lng == null
  );

  const onlineCount = resolvedScreens.filter((s) => s.is_online).length;
  const offlineCount = resolvedScreens.length - onlineCount;

  useEffect(() => {
    // Only run on the client
    if (typeof window === "undefined") return;

    let L: any;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((mod) => {
      L = mod.default || mod;

      // Fix default marker icon path issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      }).setView([20, 0], 2); // World view as default

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Fit bounds to markers after a short delay to let tiles load
      setTimeout(() => map.invalidateSize(), 200);

      // --- Marker Icons ---

      // Green circle for online + location available
      const onlineIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });

      // Red circle for offline + location available
      const offlineIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });

      const bounds: number[][] = [];

      // Render markers for screens WITH location data
      for (const screen of screensWithLocation) {
        if (screen.resolved_lat == null || screen.resolved_lng == null) continue;

        const lat = screen.resolved_lat;
        const lng = screen.resolved_lng;
        bounds.push([lat, lng]);

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

        markersRef.current.push(marker);
      }

      // Fit map to all markers if there are any
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [resolvedScreens]);

  // Empty State
  if (resolvedScreens.length === 0) {
    return (
      <SectionCard
        title="Live Map"
        subtitle="No screens to display"
      >
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
      {/* Leaflet CSS is loaded via CDN in layout or via import — ensure it's available */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </SectionCard>
  );
}
