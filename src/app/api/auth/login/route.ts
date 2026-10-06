import { LoginSchema } from "@/features/auth/schemas";
import { login } from "@/features/auth/server/credentials.service";
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
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", requestId },
      { status: 401 },
    );
  }

  try {
    const database = await connectDatabase();
    const db = database.connection.db;
    if (!db) throw new Error("Database connection is not ready");
    const address = clientAddress(request);
    const [ipLimit, accountLimit] = await Promise.all([
      enforceRateLimit(db, `login-ip:${address}`, 100, 900),
      enforceRateLimit(db, `login-user:${parsed.data.username}`, 100, 900),
    ]);
    if (!ipLimit.allowed || !accountLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED", requestId },
        {
          status: 429,
          headers: {
            "retry-after": String(
              Math.max(ipLimit.retryAfterSeconds, accountLimit.retryAfterSeconds),
            ),
          },
        },
      );
    }

    const sessionUser = await login(parsed.data);
    const token = await createSessionToken(sessionUser.user, sessionUser.authVersion);
    const response = NextResponse.json({
      data: { user: sessionUser.user },
      requestId,
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return handleApiError(error, requestId, "Login failed");
  }
}
