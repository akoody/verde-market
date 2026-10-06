import { RegisterSchema } from "@/features/auth/schemas";
import { register } from "@/features/auth/server/credentials.service";
import { handleApiError } from "@/shared/server/http";
import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/features/auth/server/session";
import { connectDatabase } from "@/shared/server/database";
import {
  clientAddress,
  enforceRateLimit,
  hasAllowedOrigin,
} from "@/shared/server/request-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 16_384) {
    return NextResponse.json({ error: "PAYLOAD_TOO_LARGE", requestId }, { status: 413 });
  }
  const parsed = RegisterSchema.safeParse(await request.json().catch(() => null));
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
    const rateLimit = await enforceRateLimit(
      db,
      `register:${clientAddress(request)}`,
      50,
      3600,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED", requestId },
        {
          status: 429,
          headers: { "retry-after": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const sessionUser = await register(parsed.data);
    const user = sessionUser.user;
    const token = await createSessionToken(user, sessionUser.authVersion);
    const response = NextResponse.json({ data: { user }, requestId }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return handleApiError(error, requestId, "Register failed");
  }
}
