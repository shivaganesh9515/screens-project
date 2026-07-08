import { Skeleton } from "@/components/ui/skeleton";

export default function TemplatesLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-9 w-36 rounded-full" />
      </div>

      <Skeleton variant="text" className="h-5 w-32" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-56" />
        ))}
      </div>

      <Skeleton variant="text" className="h-5 w-32" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-56" />
        ))}
      </div>
    </div>
  );
}
