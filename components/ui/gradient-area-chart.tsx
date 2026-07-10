"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface GradientAreaChartProps {
  data: Array<Record<string, string | number>>
  xKey?: string
  yKey?: string
  gradientId?: string
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showYAxis?: boolean
  color?: string
  className?: string
  children?: React.ReactNode
}

function GradientAreaChart({
  data,
  xKey = "date",
  yKey = "value",
  gradientId = "blueGradient",
  height = 250,
  showGrid = true,
  showTooltip = true,
  showYAxis = false,
  color = "var(--color-primary)",
  className,
  children,
}: GradientAreaChartProps) {
  const chartConfig = {
    [yKey]: { label: yKey, color },
  } satisfies ChartConfig

  const clipId = React.useId()

  return (
    <div className={cn("w-full overflow-hidden", className)} style={{ height }}>
      <ChartContainer config={chartConfig}>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
            <clipPath id={`${clipId}-chart-clip`}>
              <rect x="0" y="8" width="100%" height="100%" />
            </clipPath>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
          )}
          {showYAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={40}
            />
          )}
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={6}
          />
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          <g clipPath={`url(#${clipId}-chart-clip)`}>
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </g>
          {children}
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

export { GradientAreaChart, type GradientAreaChartProps }
