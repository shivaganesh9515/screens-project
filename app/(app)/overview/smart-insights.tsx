"use client";

import { HeartPulse, TriangleAlert, CheckCircle2, TrendingUp } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

interface SmartInsightsProps {
  totalScreens: number;
  onlineScreens: number;
  offlineScreens: number;
  topContentName?: string;
  topContentPlays?: number;
}

export function SmartInsights({
  totalScreens,
  onlineScreens,
  offlineScreens,
  topContentName,
  topContentPlays,
}: SmartInsightsProps) {
  const uptimePercent =
    totalScreens > 0 ? Math.round((onlineScreens / totalScreens) * 100) : 0;

  const insights: Array<{
    icon: React.ReactNode;
    iconBg: string;
    text: string;
  }> = [
    {
      icon: <HeartPulse className="h-4 w-4 text-emerald-500" />,
      iconBg: "bg-emerald-50/80",
      text:
        uptimePercent >= 95
          ? `Uptime is ${uptimePercent}% this week — excellent`
          : `Uptime is ${uptimePercent}% this week`,
    },
    {
      icon:
        offlineScreens > 0 ? (
          <TriangleAlert className="h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ),
      iconBg: offlineScreens > 0 ? "bg-destructive/10" : "bg-emerald-50/80",
      text:
        offlineScreens > 0
          ? `${offlineScreens} screen${offlineScreens > 1 ? "s" : ""} currently offline`
          : "All screens online",
    },
    ...(topContentName
      ? [
          {
            icon: <TrendingUp className="h-4 w-4 text-primary" />,
            iconBg: "bg-primary/10",
            text: `"${topContentName}" played ${topContentPlays} times today`,
          },
        ]
      : []),
  ];

  return (
    <SectionCard title="Smart Insights">
      <div className="space-y-3">
        {insights.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
            >
              {item.icon}
            </div>
            <p className="text-sm text-card-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
