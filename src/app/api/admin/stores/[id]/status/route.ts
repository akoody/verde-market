import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";
import { hasAllowedOrigin } from "@/shared/server/request-security";
import { handleApiError, isObjectId } from "@/shared/server/http";
import { StoreModerationSchema } from "@/features/moderation/schemas";
import { moderateStore } from "@/features/moderation/server/moderation.service";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  if (!hasAllowedOrigin(request))
    return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
  const user = await getCurrentUser();
  if (!user?.roles.includes("admin"))
    return NextResponse.json({ error: "UNAUTHORIZED", requestId }, { status: 401 });
  const parsed = StoreModerationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "VALIDATION_ERROR", requestId }, { status: 400 });
  const { id } = await params;
  if (!isObjectId(id))
    return NextResponse.json({ error: "NOT_FOUND", requestId }, { status: 404 });
  try {
    await moderateStore(id, parsed.data.status);
    return NextResponse.json({ data: { success: true }, requestId });
  } catch (error) {
    return handleApiError(error, requestId, "Store moderation failed");
  }
}
