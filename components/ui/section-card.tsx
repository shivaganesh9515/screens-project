import { cn } from "@/lib/utils"

interface SectionCardProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  size?: "default" | "sm"
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  size = "default",
}: SectionCardProps) {
  const hasHeader = title || subtitle || action

  return (
    <div
      data-slot="section-card"
      className={cn(
        "rounded-[var(--radius)] bg-card shadow-card",
        size === "sm" ? "p-4" : "p-6",
        className,
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            size === "sm" ? "mb-3" : "mb-4",
          )}
        >
          <div className="flex flex-col gap-0.5">
            {title && (
              <h3
                className={cn(
                  "font-semibold text-card-foreground",
                  size === "sm" ? "text-base" : "text-lg",
                )}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export { SectionCard, type SectionCardProps }
