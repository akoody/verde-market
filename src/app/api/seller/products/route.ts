import { CreateProductSchema } from "@/features/catalog/schemas";
import { createProduct } from "@/features/catalog/server/create.service";
import { handleApiError } from "@/shared/server/http";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";
import { hasAllowedOrigin } from "@/shared/server/request-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user?.roles.includes("seller")) {
    return NextResponse.json({ error: "UNAUTHORIZED", requestId }, { status: 401 });
  }
  const parsed = CreateProductSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten(), requestId },
      { status: 400 },
    );
  }

  try {
    const data = await createProduct(user.id, parsed.data);
    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (error) {
    return handleApiError(error, requestId, "Product creation failed");
  }
}
