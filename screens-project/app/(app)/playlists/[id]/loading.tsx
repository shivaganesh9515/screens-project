import { Skeleton } from "@/components/ui/skeleton";

export default function PlaylistDetailLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-5 w-5" />
        <Skeleton variant="text" className="h-8 w-48" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
    </div>
  );
}
