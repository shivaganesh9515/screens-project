import { Skeleton } from "@/components/ui/skeleton";

export default function ScreensLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-36" />
        <Skeleton variant="text" className="h-9 w-36 rounded-full" />
      </div>

      <Skeleton variant="text" className="h-10 w-64 rounded-full" />

      <Skeleton variant="card" className="h-64" />
    </div>
  );
}
