import { useMemo, type ReactNode } from "react";

interface StaggerOptions {
  /** Index of the current item in the list */
  index: number;
  /** Items per row (used to compute column position for row-based stagger) */
  itemsPerRow?: number;
  /** Delay between each item in ms (default: 40) */
  baseDelay?: number;
  /** Animation duration in ms (default: 350, matches CSS slide-up) */
  duration?: number;
  /** Minimum delay before first item animates (default: 50) */
  initialDelay?: number;
  /** Whether the animation is enabled (default: true) */
  enabled?: boolean;
}

interface StaggerResult {
  /** Inline style to apply to the element for animation delay */
  style: React.CSSProperties;
  /** CSS animation class name */
  className: string;
}

export function useStaggerAnimation({
  index,
  itemsPerRow = 1,
  baseDelay = 40,
  duration = 350,
  initialDelay = 50,
  enabled = true,
}: StaggerOptions): StaggerResult {
  return useMemo(() => {
    if (!enabled) {
      return { style: {}, className: "" };
    }

    const rowIndex = Math.floor(index / itemsPerRow);
    const colIndex = index % itemsPerRow;
    const delay = initialDelay + (rowIndex * itemsPerRow + colIndex) * baseDelay;

    return {
      style: { animationDelay: `${delay}ms` },
      className: "animate-slide-up",
    };
  }, [index, itemsPerRow, baseDelay, duration, initialDelay, enabled]);
}

interface StaggerWrapperProps extends StaggerOptions {
  children: ReactNode;
  className?: string;
}

export function StaggerWrapper({
  index,
  itemsPerRow = 1,
  baseDelay = 40,
  duration = 350,
  initialDelay = 50,
  enabled = true,
  children,
  className = "",
}: StaggerWrapperProps) {
  const { style, className: animClass } = useStaggerAnimation({
    index,
    itemsPerRow,
    baseDelay,
    duration,
    initialDelay,
    enabled,
  });

  return (
    <div style={style} className={`${animClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
