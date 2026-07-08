"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface CapsuleInputProps
  extends Omit<React.ComponentProps<typeof Input>, "className"> {
  variant?: "pill" | "rounded"
  className?: string
}

const CapsuleInput = React.forwardRef<HTMLInputElement, CapsuleInputProps>(
  ({ variant = "rounded", className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          variant === "pill" ? "rounded-full" : "rounded-lg",
          className,
        )}
        {...props}
      />
    )
  },
)
CapsuleInput.displayName = "CapsuleInput"

export { CapsuleInput, type CapsuleInputProps }
