import { connectDatabase } from "@/shared/server/database";
import { ProductModel } from "./product.model";
import { StoreModel } from "@/features/stores/server/store.model";
import { toFarm, toProduct } from "./mappers";

export type CatalogQuery = {
  q?: string;
  category?: string;
  ids?: string;
  limit: number;
  offset: number;
};
const publicStore = { isActive: true, verificationStatus: "verified" } as const;

export async function listProducts(query: CatalogQuery) {
  await connectDatabase();
  const stores = await StoreModel.find(publicStore).lean();
  const filter: Record<string, unknown> = {
    status: "active",
    storeId: { $in: stores.map((store) => store._id) },
  };
  if (query.category) filter.categoryId = query.category;
  if (query.q) filter.$text = { $search: query.q };
  if (query.ids) filter.externalId = { $in: query.ids.split(",") };
  const [rows, total] = await Promise.all([
    ProductModel.find(filter)
      .sort(
        query.q ? { score: { $meta: "textScore" }, _id: 1 } : { createdAt: -1, _id: 1 },
      )
      .skip(query.offset)
      .limit(query.limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);
  const storesById = new Map(stores.map((store) => [String(store._id), store]));
  const data = rows.map((product) =>
    toProduct(product, storesById.get(String(product.storeId))!),
  );
  return { data, meta: { total, limit: query.limit, offset: query.offset } };
}

export async function listFarms() {
  await connectDatabase();
  return (await StoreModel.find(publicStore).sort({ createdAt: -1 }).limit(3).lean()).map(
    toFarm,
  );
}

export async function getProductDetail(slug: string) {
  await connectDatabase();
  const product = await ProductModel.findOne({ slug, status: "active" }).lean();
  if (!product) return null;
  const store = await StoreModel.findOne({ _id: product.storeId, ...publicStore }).lean();
  if (!store) return null;
  const related = await listProducts({
    category: product.categoryId,
    limit: 5,
    offset: 0,
  });
  return {
    product: toProduct(product, store),
    farm: toFarm(store),
    related: related.data.filter((item) => item.id !== product.externalId).slice(0, 4),
  };
}

export async function listProductSlugs() {
  await connectDatabase();
  const stores = await StoreModel.find(publicStore).select("_id").lean();
  return ProductModel.find({
    status: "active",
    storeId: { $in: stores.map((store) => store._id) },
  })
    .select("slug updatedAt")
    .lean();
}
