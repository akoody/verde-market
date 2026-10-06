import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { connectDatabase } from "@/shared/server/database";
import { UserModel } from "@/features/auth/server/user.model";

export const SESSION_COOKIE = "verde_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

import type { SessionUser, UserRole } from "../types";

function sessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser, authVersion: number) {
  return new SignJWT({
    username: user.username,
    roles: user.roles,
    authVersion,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, sessionSecret(), {
    algorithms: ["HS256"],
  });
  if (!payload.sub || typeof payload.authVersion !== "number") return null;
  return { userId: payload.sub, authVersion: payload.authVersion };
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    if (!session) return null;
    await connectDatabase();
    const user = await UserModel.findById(session.userId)
      .select("username name roles status authVersion")
      .lean();
    if (!user || user.status !== "active" || user.authVersion !== session.authVersion) {
      return null;
    }
    return {
      id: String(user._id),
      username: user.username,
      name: user.name ?? undefined,
      roles: user.roles as UserRole[],
    };
  } catch {
    return null;
  }
});
