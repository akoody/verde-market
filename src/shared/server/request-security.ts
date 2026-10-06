import type { NextRequest } from "next/server";
import type { Db } from "mongodb";

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function hasAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configuredOrigin = (
    process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL
  )?.replace(/\/$/, "");
  return origin === (configuredOrigin ?? request.nextUrl.origin);
}

export function clientAddress(request: NextRequest) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function enforceRateLimit(
  db: Db,
  key: string,
  limit = 10,
  windowSeconds = 600,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
  const expiresAt = new Date(windowStart + windowSeconds * 1000 * 2);
  const id = `${key}:${windowStart}`;
  const result = await db
    .collection<{ _id: string; count: number; expiresAt: Date }>("rate_limits")
    .findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after" },
    );
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart + windowSeconds * 1000 - now) / 1000),
  );
  return { allowed: (result?.count ?? 0) <= limit, retryAfterSeconds };
}
