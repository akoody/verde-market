import { OrderStatusSchema } from "@/features/orders/schemas";
import { updateOrderStatus } from "@/features/orders/server/status.service";
import { handleApiError, isObjectId } from "@/shared/server/http";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";
import { hasAllowedOrigin } from "@/shared/server/request-security";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user?.roles.includes("seller")) {
    return NextResponse.json({ error: "UNAUTHORIZED", requestId }, { status: 401 });
  }
  const parsed = OrderStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR", requestId }, { status: 400 });
  }

  try {
    const { id } = await params;
    if (!isObjectId(id))
      return NextResponse.json({ error: "ORDER_NOT_FOUND", requestId }, { status: 404 });
    await updateOrderStatus(user.id, id, parsed.data.status);
    return NextResponse.json({ data: { success: true }, requestId });
  } catch (error) {
    return handleApiError(error, requestId, "Order status update failed");
  }
}
