import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="text" className="h-9 w-32 rounded-full" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-48" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-52" />
        </div>
      </div>
    </div>
  );
}
