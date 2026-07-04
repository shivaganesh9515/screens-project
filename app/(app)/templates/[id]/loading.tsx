import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateDetailLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-5 w-5" />
        <Skeleton variant="text" className="h-8 w-48" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Skeleton variant="card" className="h-80" />
        <div className="space-y-3">
          <Skeleton variant="text" className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}
