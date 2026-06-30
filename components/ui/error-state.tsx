import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  retry?: () => void;
  retryLabel?: string;
  className?: string;
}

function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Something went wrong",
  description,
  retry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center",
        className
      )}
    >
      <Icon className="mx-auto mb-3 h-10 w-10 text-destructive/40" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground/60">
          {description}
        </p>
      )}
      {retry && (
        <Button variant="outline" size="sm" onClick={retry} className="mt-4 rounded-xl">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
