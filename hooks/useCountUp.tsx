import { useState, useEffect, useRef, type ReactNode } from "react";

interface CountUpOptions {
  /** Target value to count up to */
  end: number;
  /** Duration in ms (default: 800) */
  duration?: number;
  /** Start counting when this becomes true (default: true) */
  startOnMount?: boolean;
  /** Number of decimal places (default: 0 for integers) */
  decimals?: number;
  /** Enable/disable (default: true) — set false for server-rendered static numbers */
  enabled?: boolean;
}

interface CountUpResult {
  /** Current animated value (formatted string) */
  value: string;
  /** Current raw number for custom formatting */
  rawValue: number;
  /** Whether the animation is in progress */
  isAnimating: boolean;
}

export function useCountUp({
  end,
  duration = 800,
  startOnMount = true,
  decimals = 0,
  enabled = true,
}: CountUpOptions): CountUpResult {
  const [rawValue, setRawValue] = useState(enabled ? 0 : end);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevEndRef = useRef(end);

  useEffect(() => {
    // Clean up previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled || !startOnMount) {
      setRawValue(end);
      setIsAnimating(false);
      return;
    }

    if (end === 0) {
      setRawValue(0);
      setIsAnimating(false);
      return;
    }

    // Start animation from 0
    setRawValue(0);
    setIsAnimating(true);

    const steps = Math.min(end, Math.max(end, 30));
    const stepTime = Math.max(16, Math.floor(duration / steps));
    let current = 0;
    const increment = Math.max(1, Math.ceil(end / steps));

    intervalRef.current = setInterval(() => {
      current += increment;
      if (current >= end) {
        setRawValue(end);
        setIsAnimating(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setRawValue(current);
      }
    }, stepTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [end, duration, startOnMount, enabled]);

  // Track end changes for re-trigger
  useEffect(() => {
    prevEndRef.current = end;
  }, [end]);

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return {
    value: formatter.format(rawValue),
    rawValue,
    isAnimating,
  };
}

interface CountUpComponentProps extends CountUpOptions {
  className?: string;
  as?: "span" | "p" | "div";
}

export function CountUp({
  end,
  duration = 800,
  startOnMount = true,
  decimals = 0,
  enabled = true,
  className = "",
  as: Tag = "span",
}: CountUpComponentProps) {
  const { value } = useCountUp({ end, duration, startOnMount, decimals, enabled });
  return <Tag className={className}>{value}</Tag>;
}
