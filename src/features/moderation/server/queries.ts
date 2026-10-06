import { connectDatabase } from "@/shared/server/database";
import { ProductModel } from "@/features/catalog/server/product.model";
import { StoreModel } from "@/features/stores/server/store.model";

export async function getModerationQueue() {
  await connectDatabase();
  const [stores, products] = await Promise.all([
    StoreModel.find({ verificationStatus: "pending" }).sort({ createdAt: 1 }).lean(),
    ProductModel.find({ status: "draft" }).sort({ createdAt: 1 }).limit(100).lean(),
  ]);
  const storeIds = [...new Set(products.map((product) => String(product.storeId)))];
  const productStores = await StoreModel.find({ _id: { $in: storeIds } })
    .select("name verificationStatus")
    .lean();
  const storesById = new Map(productStores.map((store) => [String(store._id), store]));

  return { stores, products, storesById };
}
