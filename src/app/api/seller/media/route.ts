import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";
import { hasAllowedOrigin } from "@/shared/server/request-security";
import { saveProductImage } from "@/features/media/server/storage";

export const runtime = "nodejs";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user?.roles.includes("seller")) {
    return NextResponse.json({ error: "UNAUTHORIZED", requestId }, { status: 401 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 100_000) {
    return NextResponse.json({ error: "FILE_TOO_LARGE", requestId }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "INVALID_FILE", requestId }, { status: 400 });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { error: "UNSUPPORTED_IMAGE", requestId },
        { status: 415 },
      );
    }

    const url = await saveProductImage(file);
    return NextResponse.json({ data: { url }, requestId }, { status: 201 });
  } catch (error) {
    console.error("Image upload failed", { requestId, error });
    return NextResponse.json(
      { error: "IMAGE_PROCESSING_FAILED", requestId },
      { status: 400 },
    );
  }
}
