import { NextRequest, NextResponse } from "next/server";
import { CatalogQuerySchema } from "@/features/catalog/schemas";
import { listProducts } from "@/features/catalog/server/queries";
import { handleApiError } from "@/shared/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const parsed = CatalogQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten(), requestId },
      { status: 400 },
    );
  try {
    const result = await listProducts(parsed.data);
    return NextResponse.json(
      { ...result, requestId },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(
      error,
      requestId,
      "Product listing failed",
      "DATABASE_UNAVAILABLE",
    );
  }
}
