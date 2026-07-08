import { Skeleton } from "@/components/ui/skeleton";

export default function MediaLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-32" />
        <Skeleton variant="text" className="h-9 w-28 rounded-full" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-10 w-64 rounded-full" />
        <Skeleton variant="text" className="h-9 w-32 rounded-full" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="aspect-[4/3] h-auto" />
        ))}
      </div>
    </div>
  );
}
