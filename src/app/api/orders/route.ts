import { CheckoutSchema } from "@/features/orders/schemas";
import { createCheckout } from "@/features/orders/server/checkout.service";
import { handleApiError } from "@/shared/server/http";
import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/shared/server/database";
import {
  clientAddress,
  enforceRateLimit,
  hasAllowedOrigin,
} from "@/shared/server/request-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 65_536) {
    return NextResponse.json({ error: "PAYLOAD_TOO_LARGE", requestId }, { status: 413 });
  }
  const parsed = CheckoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten(), requestId },
      { status: 400 },
    );
  }

  try {
    const database = await connectDatabase();
    const db = database.connection.db;
    if (!db) throw new Error("Database connection is not ready");
    const rateLimit = await enforceRateLimit(db, `order:${clientAddress(request)}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED", requestId },
        {
          status: 429,
          headers: { "retry-after": String(rateLimit.retryAfterSeconds) },
        },
      );
    }
    const result = await createCheckout(parsed.data);

    return NextResponse.json({ data: { orders: result }, requestId }, { status: 201 });
  } catch (error) {
    return handleApiError(
      error,
      requestId,
      "Order creation failed",
      "DATABASE_UNAVAILABLE",
    );
  }
}
