"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SelectTrigger } from "@/components/ui/select"

interface CapsuleSelectTriggerProps
  extends Omit<React.ComponentProps<typeof SelectTrigger>, "className"> {
  variant?: "pill" | "rounded"
  className?: string
}

function CapsuleSelect({
  variant = "rounded",
  className,
  ...props
}: CapsuleSelectTriggerProps) {
  return (
    <SelectTrigger
      className={cn(
        variant === "pill" ? "rounded-full" : "rounded-lg",
        className,
      )}
      {...props}
    />
  )
}

export { CapsuleSelect, type CapsuleSelectTriggerProps }
