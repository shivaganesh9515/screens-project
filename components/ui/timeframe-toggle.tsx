"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type TimeframeValue = "1D" | "1W" | "1M" | "1Y" | "ALL"

interface TimeframeToggleProps {
  value: TimeframeValue
  onValueChange: (value: TimeframeValue) => void
  className?: string
}

const TIMEFRAMES: TimeframeValue[] = ["1D", "1W", "1M", "1Y", "ALL"]

function TimeframeToggle({
  value,
  onValueChange,
  className,
}: TimeframeToggleProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(newValues: string[]) => {
        if (newValues.length > 0) onValueChange(newValues[0] as TimeframeValue)
      }}
      size="sm"
      spacing={2}
      className={cn("h-7", className)}
    >
      {TIMEFRAMES.map((item) => (
        <ToggleGroupItem
          key={item}
          value={item}
          className="rounded-full px-3 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
        >
          {item}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { TimeframeToggle, type TimeframeToggleProps, type TimeframeValue }
