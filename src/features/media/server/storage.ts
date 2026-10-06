import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import path from "node:path";

export const uploadDirectory = () =>
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");

export async function saveProductImage(file: File) {
  const output = await sharp(Buffer.from(await file.arrayBuffer()), {
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();
  const name = `${randomUUID()}.webp`;
  const directory = uploadDirectory();
  await mkdir(directory, { recursive: true, mode: 0o750 });
  await writeFile(path.join(directory, name), output, {
    mode: 0o640,
    flag: "wx",
  });
  return `/api/media/${name}`;
}
