import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { usernameSchema, passwordSchema } from "../src/features/auth/schemas";
import { farms, products } from "./fixtures/catalog";
import { ProductModel } from "../src/features/catalog/server/product.model";
import { OrderModel } from "../src/features/orders/server/order.model";
import { StoreModel } from "../src/features/stores/server/store.model";
import { UserModel } from "../src/features/auth/server/user.model";

loadEnvConfig(process.cwd());

const coordinates: Record<string, [number, number]> = {
  "farm-1": [28.7774, 46.9435],
  "farm-2": [28.8333, 47.3833],
  "farm-3": [28.6083, 47.1425],
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  const ownerPhone = process.env.SEED_OWNER_PHONE;
  if (!ownerPhone || !/^\+373[0-9]{8}$/.test(ownerPhone)) {
    throw new Error("SEED_OWNER_PHONE must be a Moldovan phone in +373XXXXXXXX format");
  }
  const ownerUsername = process.env.SEED_OWNER_USERNAME;
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  if (!ownerUsername || !usernameSchema.safeParse(ownerUsername).success) {
    throw new Error("SEED_OWNER_USERNAME must be a valid lowercase login");
  }
  if (!ownerPassword || !passwordSchema.safeParse(ownerPassword).success) {
    throw new Error("SEED_OWNER_PASSWORD must contain at least 10 characters");
  }
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Demo seeding in production requires ALLOW_DEMO_SEED=true");
  }
  await mongoose.connect(uri);
  const passwordHash = await hash(ownerPassword, 12);

  const owner = await UserModel.findOneAndUpdate(
    { username: ownerUsername },
    {
      $set: {
        username: ownerUsername,
        passwordHash,
        phoneE164: ownerPhone,
        name: "Verde bootstrap",
        roles: ["seller", "admin"],
        status: "active",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const storeIds = new Map<string, mongoose.Types.ObjectId>();
  for (const farm of farms) {
    const store = await StoreModel.findOneAndUpdate(
      { externalId: farm.id },
      {
        $set: {
          ownerId: owner._id,
          slug: farm.slug,
          name: farm.name,
          description: `${farm.name} — проверенное фермерское хозяйство в Молдове.`,
          location: { type: "Point", coordinates: coordinates[farm.id] },
          addressLabel: farm.location,
          deliveryRadiusKm: 60,
          minOrderMinor: farm.minOrder * 100,
          deliveryFeeMinor: 50 * 100,
          paymentMethods: ["cash_on_delivery", "card_on_delivery"],
          deliveryDays: [2, 4, 6],
          verificationStatus: farm.verified ? "verified" : "pending",
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    storeIds.set(farm.id, store._id);
  }

  for (const product of products) {
    const storeId = storeIds.get(product.farmId);
    if (!storeId) throw new Error(`Store not found for ${product.id}`);
    await ProductModel.findOneAndUpdate(
      { externalId: product.id },
      {
        $set: {
          storeId,
          storeExternalId: product.farmId,
          slug: product.slug,
          title: product.title,
          description: product.description,
          categoryId: product.categoryId,
          priceMinor: product.price * 100,
          compareAtPriceMinor: product.oldPrice ? product.oldPrice * 100 : undefined,
          unit: product.unit,
          images: product.gallery ?? [product.image],
          rating: product.rating,
          reviewsCount: product.reviews,
          badge: product.badge,
          status: "active",
        },
        $setOnInsert: { stock: product.stock },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  await Promise.all([
    UserModel.createIndexes(),
    StoreModel.createIndexes(),
    ProductModel.createIndexes(),
    OrderModel.createIndexes(),
    mongoose.connection
      .collection("rate_limits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limit_ttl" }),
  ]);

  console.log(`Seed complete: ${farms.length} stores, ${products.length} products`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
