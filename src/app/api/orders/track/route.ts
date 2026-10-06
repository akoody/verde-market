import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackOrders } from "@/features/orders/server/tracking.queries";

export const runtime = "nodejs";

const BodySchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_TOKEN", requestId }, { status: 400 });
  }

  try {
    const orders = await trackOrders(parsed.data.token);
    return NextResponse.json(
      { data: { orders }, requestId },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Order tracking failed", { requestId, error });
    return NextResponse.json(
      { error: "DATABASE_UNAVAILABLE", requestId },
      { status: 503 },
    );
  }
}
