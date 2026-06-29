"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type TrendDirection = "up" | "down" | "neutral"

interface TrendPillProps {
  value: string | number
  direction: TrendDirection
  variant?: "default" | "subtle"
  size?: "sm" | "default"
  className?: string
}

const iconMap: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

function TrendPill({
  value,
  direction,
  variant = "default",
  size = "default",
  className,
}: TrendPillProps) {
  const Icon = iconMap[direction]
  const isSubtle = variant === "subtle"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "h-5 text-[11px]" : "h-6 text-xs px-1.5",
        direction === "up" &&
          (isSubtle
            ? "bg-success/5 text-success/80"
            : "bg-success/10 text-success"),
        direction === "down" &&
          (isSubtle
            ? "bg-destructive/5 text-destructive/80"
            : "bg-destructive/10 text-destructive"),
        direction === "neutral" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "size-2.5" : "size-3",
        )}
      />
      {value}
    </span>
  )
}

export { TrendPill, type TrendPillProps, type TrendDirection }
