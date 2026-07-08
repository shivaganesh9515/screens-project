import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-44" />
        <Skeleton variant="text" className="h-9 w-32 rounded-full" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton variant="chart" />
        <Skeleton variant="chart" />
      </div>

      <Skeleton variant="card" className="h-64" />
    </div>
  );
}
