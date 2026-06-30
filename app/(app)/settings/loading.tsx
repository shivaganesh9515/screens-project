import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <Skeleton variant="text" className="h-8 w-40" />

      <div className="space-y-5">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-36" />
        <Skeleton variant="card" className="h-44" />
      </div>
    </div>
  );
}
