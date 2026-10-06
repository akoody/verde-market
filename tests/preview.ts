import { spawn } from "node:child_process";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { StoreModel } from "../src/features/stores/server/store.model";
import { ProductModel } from "../src/features/catalog/server/product.model";

async function preview() {
  const replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replica.getUri("verde_preview");
  await mongoose.connect(uri);
  const store = await StoreModel.create({
    externalId: "preview-farm",
    ownerId: new mongoose.Types.ObjectId(),
    slug: "preview",
    name: "Тестовая ферма",
    addressLabel: "Кишинёв",
    deliveryRadiusKm: 20,
    verificationStatus: "verified",
    isActive: true,
    minOrderMinor: 100,
    deliveryFeeMinor: 500,
  });
  await ProductModel.create({
    externalId: "preview-product",
    storeExternalId: store.externalId,
    storeId: store._id,
    slug: "preview-tomatoes",
    title: "Томаты розовые",
    description: "Продукт для локальной проверки интерфейса и запросов.",
    categoryId: "vegetables",
    priceMinor: 4800,
    stock: 10,
    unit: "кг",
    images: ["/product-placeholder.svg"],
    status: "active",
  });
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3098"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        MONGODB_URI: uri,
        AUTH_SECRET: "preview-only-secret-".repeat(4),
        APP_URL: "http://localhost:3098",
        NEXT_PUBLIC_APP_URL: "http://localhost:3098",
      },
    },
  );
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    child.kill("SIGTERM");
    await mongoose.disconnect();
    await replica.stop();
    process.exit();
  };
  process.on("SIGINT", () => void stop());
  process.on("SIGTERM", () => void stop());
  child.on("exit", () => void stop());
}
preview().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
