import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { UserModel } from "../src/features/auth/server/user.model";
import { StoreModel } from "../src/features/stores/server/store.model";
import { ProductModel } from "../src/features/catalog/server/product.model";
import { OrderModel } from "../src/features/orders/server/order.model";

loadEnvConfig(process.cwd());

async function migrate() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);
  const indexes = await mongoose.connection
    .collection("users")
    .indexes()
    .catch((error: unknown) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 26
      )
        return [];
      throw error;
    });
  const legacyPhoneIndex = indexes.find(
    (index) => index.name === "phoneE164_1" && index.unique,
  );
  if (legacyPhoneIndex)
    await mongoose.connection.collection("users").dropIndex("phoneE164_1");
  // Add declared indexes without dropping unrelated production indexes.
  await Promise.all([
    UserModel.createIndexes(),
    StoreModel.createIndexes(),
    ProductModel.createIndexes(),
    OrderModel.createIndexes(),
  ]);
  await mongoose.connection
    .collection("rate_limits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limit_ttl" });
  console.log("Database indexes are up to date");
}

migrate()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
