"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export { ErrorBoundaryWrapper };
