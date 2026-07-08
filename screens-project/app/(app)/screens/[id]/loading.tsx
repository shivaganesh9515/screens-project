import { Skeleton } from "@/components/ui/skeleton";

export default function ScreenDetailLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-5 w-5" />
        <Skeleton variant="text" className="h-8 w-48" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-48" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </div>
    </div>
  );
}
