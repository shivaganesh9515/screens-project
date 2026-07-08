import { Skeleton } from "@/components/ui/skeleton";

export default function AdvertiserAnalyticsLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton variant="text" className="h-7 w-52" />
          <Skeleton variant="text" className="h-4 w-72" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* Chart area */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton variant="chart" />
        <Skeleton variant="chart" />
      </div>

      {/* Table */}
      <Skeleton variant="card" className="h-72" />
    </div>
  );
}
