import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "card" | "text" | "avatar" | "chart"
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variant === "card" && "h-32 rounded-2xl",
        variant === "text" && "h-4 rounded",
        variant === "avatar" && "h-10 w-10 rounded-full",
        variant === "chart" && "h-48 rounded-2xl",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
