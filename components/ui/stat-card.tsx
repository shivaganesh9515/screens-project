"use client"

import { cn } from "@/lib/utils"
import { SectionCard } from "@/components/ui/section-card"
import { TrendPill, type TrendPillProps } from "@/components/ui/trend-pill"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: TrendPillProps
  variant?: "default" | "hero"
  className?: string
}

function StatCard({
  icon,
  label,
  value,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <SectionCard className={className}>
      <div
        className={cn(
          "mb-2 flex size-9 items-center justify-center rounded-[var(--radius-sm)] [&_svg]:size-4",
          variant === "hero"
            ? "bg-primary-muted text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-bold tabular-nums tracking-tight text-card-foreground",
          variant === "hero" && "text-primary",
        )}
      >
        {value}
      </p>
      {trend && (
        <div className="mt-3">
          <TrendPill {...trend} />
        </div>
      )}
    </SectionCard>
  )
}

export { StatCard, type StatCardProps }
