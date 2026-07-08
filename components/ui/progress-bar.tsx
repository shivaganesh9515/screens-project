"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  label: string
  color?: "blue" | "emerald" | "coral"
  size?: "sm" | "default"
  showValue?: boolean
  className?: string
}

const colorMap: Record<string, string> = {
  blue: "bg-primary",
  emerald: "bg-success",
  coral: "bg-destructive",
}

function ProgressBar({
  value,
  label,
  color = "blue",
  size = "default",
  showValue = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {label}
        </span>
        {showValue && (
          <span
            className={cn(
              "font-semibold tabular-nums text-foreground",
              size === "sm" ? "text-xs" : "text-sm",
            )}
          >
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
      <div
        className={cn(
          "rounded-full bg-muted overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorMap[color],
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar, type ProgressBarProps }
