import { Skeleton } from "@/components/ui/skeleton";

export default function PlaylistsLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="text" className="h-9 w-32 rounded-full" />
      </div>

      <Skeleton variant="text" className="h-10 w-64 rounded-full" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-32" />
        ))}
      </div>
    </div>
  );
}
