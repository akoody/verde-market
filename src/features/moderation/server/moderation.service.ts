import { connectDatabase } from "@/shared/server/database";
import { AppError } from "@/shared/lib/errors";
import { ProductModel } from "@/features/catalog/server/product.model";
import { StoreModel } from "@/features/stores/server/store.model";

export async function moderateProduct(id: string, status: "active" | "archived") {
  await connectDatabase();
  const product = await ProductModel.findById(id).lean();
  if (!product) throw new AppError("NOT_FOUND", 404);
  if (status === "active") {
    const verifiedStore = await StoreModel.exists({
      _id: product.storeId,
      verificationStatus: "verified",
      isActive: true,
    });
    if (!verifiedStore) throw new AppError("STORE_NOT_VERIFIED", 409);
  }
  await ProductModel.updateOne({ _id: product._id }, { $set: { status } });
}

export async function moderateStore(id: string, status: "verified" | "rejected") {
  await connectDatabase();
  const store = await StoreModel.findByIdAndUpdate(
    id,
    { $set: { verificationStatus: status, isActive: status === "verified" } },
    { new: true },
  );
  if (!store) throw new AppError("NOT_FOUND", 404);
}
