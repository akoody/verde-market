import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json(
    { data: { user } },
    { headers: { "cache-control": "private, no-store" } },
  );
}
