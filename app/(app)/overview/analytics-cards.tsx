"use client";

import { Monitor, Wifi, WifiOff, Play } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface AnalyticsCardsProps {
  totalScreens: number;
  onlineScreens: number;
  offlineScreens: number;
  totalMedia: number;
  totalImpressions: number;
  avgPlaybackRate?: number;
  screenTrend?: number;
  onlineTrend?: number;
  offlineTrend?: number;
  contentTrend?: number;
}

export function AnalyticsCards({
  totalScreens,
  onlineScreens,
  offlineScreens,
  totalMedia,
  totalImpressions,
  avgPlaybackRate = 0,
  screenTrend = 12,
  onlineTrend = 5,
  offlineTrend = -3,
  contentTrend = 8,
}: AnalyticsCardsProps) {
  const activeContent = Math.min(
    totalImpressions > 0 ? Math.round((totalImpressions / Math.max(totalScreens, 1)) * 2) : 0,
    Math.max(totalMedia, 50),
  );

  const trendToPill = (value: number, suffix?: string) => ({
    value: `${Math.abs(value)}%`,
    direction: (value > 0 ? "up" : value < 0 ? "down" : "neutral") as "up" | "down" | "neutral",
    size: "sm" as const,
    variant: "subtle" as const,
  });

  const cards = [
    {
      icon: <Monitor className="text-primary" />,
      label: "Total Screens",
      value: totalScreens,
      trend: trendToPill(screenTrend, "vs last month"),
    },
    {
      icon: <Wifi className="text-emerald-500" />,
      label: "Screens Online",
      value: onlineScreens,
      trend: trendToPill(onlineTrend, "vs yesterday"),
    },
    {
      icon: <WifiOff className="text-red-400" />,
      label: "Screens Offline",
      value: offlineScreens,
      trend: trendToPill(offlineTrend, "vs yesterday"),
    },
    {
      icon: <Play className="text-emerald-500" />,
      label: "Active Content",
      value: activeContent.toLocaleString(),
      trend: trendToPill(contentTrend, "vs last week"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={card.label}
          className="animate-slide-up"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <StatCard
            icon={card.icon}
            label={card.label}
            value={card.value}
            trend={card.trend}
          />
        </div>
      ))}
    </div>
  );
}
