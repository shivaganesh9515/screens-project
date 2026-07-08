"use client";

import { SectionCard } from "@/components/ui/section-card";
import { ProgressBar } from "@/components/ui/progress-bar";

interface OperationalMetricsProps {
  fleetUptime: number;
  storageUsed: number;
  contentFreshness: number;
}

export function OperationalMetrics({
  fleetUptime,
  storageUsed,
  contentFreshness,
}: OperationalMetricsProps) {
  return (
    <SectionCard title="Operational Metrics">
      <div className="space-y-4">
        <ProgressBar label="Fleet Uptime" value={fleetUptime} color="blue" />
        <ProgressBar label="Storage Used" value={storageUsed} color="blue" />
        <ProgressBar
          label="Content Freshness"
          value={contentFreshness}
          color="emerald"
        />
      </div>
    </SectionCard>
  );
}
