"use client";

import { useEffect, useRef, useMemo } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { MapPin } from "lucide-react";

interface ScreenMapData {
  id: string;
  name: string;
  is_online: boolean;
  screen_type: "static" | "bus" | "auto";
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
    }).filter((s) => s.resolved_lat != null && s.resolved_lng != null);
  }, [screens, locations]);

  useEffect(() => {
    // Only run on the client
    if (typeof window === "undefined") return;

    let Leaflet: any;
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
      }).setView([37.7749, -122.4194], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Fit bounds to markers after a short delay to let tiles load
      setTimeout(() => map.invalidateSize(), 200);

      // Add markers
      // Green circle for online, grey/red for offline
      const onlineIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });

      const offlineIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#9ca3af;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });

      const bounds: number[][] = [];

      for (const screen of resolvedScreens) {
        if (screen.resolved_lat == null || screen.resolved_lng == null) continue;

        const lat = screen.resolved_lat;
        const lng = screen.resolved_lng;
        bounds.push([lat, lng]);

        const icon = screen.is_online ? onlineIcon : offlineIcon;
        const marker = L.marker([lat, lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;padding:4px 2px;min-width:160px;">
            <p style="margin:0 0 6px;font-weight:600;font-size:14px;color:#0F1A2E;">${screen.name}</p>
            <p style="margin:0;font-size:13px;display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${
                screen.is_online ? "#22c55e" : "#9ca3af"
              };"></span>
              <span style="color:${screen.is_online ? "#16a34a" : "#6b7280"};font-weight:500;">
                ${screen.is_online ? "Online" : "Offline"}
              </span>
              <span style="margin-left:auto;font-size:11px;color:#9ca3af;text-transform:capitalize;">${screen.screen_type}</span>
            </p>
          </div>
        `);

        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());

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

  const onlineCount = resolvedScreens.filter((s) => s.is_online).length;
  const totalCount = resolvedScreens.length;

  return (
    <SectionCard
      title="Live Map"
      subtitle={`${totalCount} screen${totalCount !== 1 ? "s" : ""} — ${onlineCount} online`}
      action={
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            Online ({onlineCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
            Offline ({totalCount - onlineCount})
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
