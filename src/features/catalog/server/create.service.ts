import { connectDatabase } from "@/shared/server/database";
import { AppError } from "@/shared/lib/errors";
import { StoreModel } from "@/features/stores/server/store.model";
import { ProductModel } from "./product.model";
import type { CreateProductInput } from "../schemas";

export async function createProduct(sellerId: string, input: CreateProductInput) {
  await connectDatabase();
  const store = await StoreModel.findOne({ ownerId: sellerId }).lean();
  if (!store) throw new AppError("STORE_REQUIRED", 409);
  const externalId = `product-${crypto.randomUUID()}`;
  const product = await ProductModel.create({
    externalId,
    storeExternalId: store.externalId,
    storeId: store._id,
    slug: externalId,
    title: input.title,
    description: input.description,
    categoryId: input.categoryId,
    priceMinor: Math.round(input.price * 100),
    unit: input.unit,
    stock: input.stock,
    images: [input.imageUrl],
    status: "draft",
  });
  return { id: String(product._id), status: product.status };
}
