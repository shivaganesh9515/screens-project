"use client"

import { cn } from "@/lib/utils"

type StatusType = "online" | "offline" | "playing" | "scheduled"

interface StatusPillProps {
  status: StatusType
  label?: string
  size?: "sm" | "default"
  className?: string
}

const statusConfig: Record<
  StatusType,
  { color: string; defaultLabel: string; dotClass: string; bgClass: string }
> = {
  online: {
    color: "var(--color-success)",
    defaultLabel: "Online",
    dotClass: "bg-success",
    bgClass: "bg-success/10 text-success",
  },
  offline: {
    color: "var(--color-destructive)",
    defaultLabel: "Offline",
    dotClass: "bg-destructive",
    bgClass: "bg-destructive/10 text-destructive",
  },
  playing: {
    color: "var(--color-success)",
    defaultLabel: "Playing",
    dotClass: "bg-success",
    bgClass: "bg-success/10 text-success",
  },
  scheduled: {
    color: "var(--color-primary)",
    defaultLabel: "Scheduled",
    dotClass: "bg-primary",
    bgClass: "bg-primary-muted text-primary",
  },
}

function StatusPill({
  status,
  label,
  size = "default",
  className,
}: StatusPillProps) {
  const config = statusConfig[status]
  const displayLabel = label ?? config.defaultLabel

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        config.bgClass,
        size === "sm" ? "h-5 text-[11px] px-2" : "h-6 text-xs px-2.5",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full",
          config.dotClass,
          size === "sm" ? "size-1.5" : "size-2",
        )}
      />
      {displayLabel}
    </span>
  )
}

export { StatusPill, type StatusPillProps, type StatusType, statusConfig }
