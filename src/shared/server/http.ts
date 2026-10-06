import { NextResponse } from "next/server";
import { AppError } from "@/shared/lib/errors";

export function handleApiError(
  error: unknown,
  requestId: string,
  operation: string,
  fallback = "SERVICE_UNAVAILABLE",
) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.code, requestId }, { status: error.status });
  }
  console.error(operation, { requestId, error });
  return NextResponse.json({ error: fallback, requestId }, { status: 503 });
}

export function isObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}
