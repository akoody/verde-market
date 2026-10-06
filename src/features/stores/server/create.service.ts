import { connectDatabase } from "@/shared/server/database";
import { AppError } from "@/shared/lib/errors";
import { StoreModel } from "@/features/stores/server/store.model";
import type { SessionUser } from "@/features/auth/types";
import type { CreateStoreInput } from "../schemas";

export async function createStore(user: SessionUser, input: CreateStoreInput) {
  await connectDatabase();
  const existing = await StoreModel.exists({ ownerId: user.id });
  if (existing) throw new AppError("STORE_ALREADY_EXISTS", 409);
  const suffix = crypto.randomUUID().slice(0, 8);
  const store = await StoreModel.create({
    externalId: `store-${crypto.randomUUID()}`,
    ownerId: user.id,
    slug: `seller-${user.username}-${suffix}`,
    name: input.name,
    description: input.description,
    addressLabel: input.addressLabel,
    deliveryRadiusKm: input.deliveryRadiusKm,
    minOrderMinor: Math.round(input.minOrder * 100),
    deliveryFeeMinor: Math.round(input.deliveryFee * 100),
    paymentMethods: input.acceptsCard
      ? ["cash_on_delivery", "card_on_delivery"]
      : ["cash_on_delivery"],
    deliveryDays: [],
    verificationStatus: "pending",
    isActive: false,
  });
  return { id: String(store._id), status: store.verificationStatus };
}
