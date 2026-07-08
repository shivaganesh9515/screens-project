import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="text" className="h-9 w-36 rounded-full" />
      </div>

      <Skeleton variant="card" className="h-[400px]" />
      <Skeleton variant="text" className="h-5 w-44" />
      <Skeleton variant="card" className="h-16" />
      <Skeleton variant="card" className="h-16" />
    </div>
  );
}
