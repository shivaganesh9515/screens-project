"use client";

import { MonitorSmartphone, Wifi, WifiOff, Image } from "lucide-react";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";

interface StatsProps {
  totalScreens: number;
  onlineScreens: number;
  offlineScreens: number;
  totalMedia: number;
}

export function OverviewStats({ totalScreens, onlineScreens, offlineScreens, totalMedia }: StatsProps) {
  const cards = [
    { label: "Total Screens", value: totalScreens, icon: MonitorSmartphone, color: "text-primary", bg: "bg-primary-muted" },
    { label: "Online", value: onlineScreens, icon: Wifi, color: "text-success", bg: "bg-success/10" },
    { label: "Offline", value: offlineScreens, icon: WifiOff, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Media Items", value: totalMedia, icon: Image, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <StaggerWrapper key={card.label} index={idx} itemsPerRow={4}>
          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-card-hover hover:border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <CountUp end={card.value} className="mt-1.5 text-3xl font-bold tracking-tight text-card-foreground" as="p" />
              </div>
              <div className={`rounded-xl ${card.bg} p-3.5 transition-transform duration-200 group-hover:scale-110`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${card.color.replace("text-", "bg-")} transition-all duration-500`} style={{ width: `${Math.min((card.value / 100) * 100, 100)}%`, opacity: card.value > 0 ? 0.6 : 0 }} />
            </div>
          </div>
        </StaggerWrapper>
      ))}
    </div>
  );
}
