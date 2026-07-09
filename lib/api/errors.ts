import { NextResponse } from "next/server";

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toResponse(requestId?: string) {
    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
          ...(this.details ? { details: this.details } : {}),
          ...(requestId ? { requestId } : {}),
        },
      },
      { status: this.status }
    );
  }
}

export function handleApiError(error: unknown, context?: string) {
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  console.error(`[API] ${context ?? "Unknown"}:`, error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 }
  );
}
