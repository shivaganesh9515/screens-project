"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Monitor, Wifi, WifiOff } from "lucide-react";

interface ScreenHealthChartProps {
  online: number;
  offline: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white px-3 py-2 text-sm shadow-dropdown">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
        <span className="font-medium text-card-foreground">{payload[0].name}</span>
        <span className="text-muted-foreground">·</span>
        <span className="font-semibold text-card-foreground">{payload[0].value} screens</span>
      </div>
    </div>
  );
};

export function ScreenHealthChart({ online, offline }: ScreenHealthChartProps) {
  const total = online + offline;
  const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 0;
  const offlinePercent = total > 0 ? Math.round((offline / total) * 100) : 0;
  const data = [
    { name: "Online", value: online, color: "#22C55E" },
    { name: "Offline", value: offline, color: "#EF4444" },
  ];

  return (
    <div className="rounded-lg border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-card-hover">
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Monitor className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-card-foreground">Screen Health</h3>
        </div>
        <p className="text-xs text-muted-foreground pl-10">Online vs Offline distribution</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={74}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-card-foreground tabular-nums">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm font-medium text-card-foreground">Online</span>
              </div>
              <span className="text-sm font-semibold text-card-foreground tabular-nums">{onlinePercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${onlinePercent}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{online} screens</p>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
                <span className="text-sm font-medium text-card-foreground">Offline</span>
              </div>
              <span className="text-sm font-semibold text-card-foreground tabular-nums">{offlinePercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: `${offlinePercent}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{offline} screens</p>
          </div>
        </div>
      </div>
    </div>
  );
}
