import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { connectDatabase } from "../../src/shared/server/database";
import { StoreModel } from "../../src/features/stores/server/store.model";
import { ProductModel } from "../../src/features/catalog/server/product.model";
import { UserModel } from "../../src/features/auth/server/user.model";
import { login, register } from "../../src/features/auth/server/credentials.service";
import { createStore } from "../../src/features/stores/server/create.service";
import { OrderModel } from "../../src/features/orders/server/order.model";
import { createCheckout } from "../../src/features/orders/server/checkout.service";
import { updateOrderStatus } from "../../src/features/orders/server/status.service";
import { listProducts } from "../../src/features/catalog/server/queries";
import { CheckoutSchema } from "../../src/features/orders/schemas";
import { summarizeCart } from "../../src/features/cart/summary";

let replica: MongoMemoryReplSet;
const owner = new mongoose.Types.ObjectId();
let productId: string;
const input = () => ({
  checkoutId: randomUUID(),
  accessToken: "a".repeat(64),
  items: [{ productId, quantity: 2 }],
  customer: { name: "Покупатель", phone: "+37369123456" },
  delivery: { address: "Кишинёв, улица Тестовая, 10" },
  paymentMethod: "cash_on_delivery" as const,
});

before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replica.getUri("verde_test");
  await connectDatabase();
  await Promise.all([
    StoreModel.init(),
    ProductModel.init(),
    OrderModel.init(),
    UserModel.init(),
  ]);
  const store = await StoreModel.create({
    externalId: "store-test",
    ownerId: owner,
    slug: "test",
    name: "Ферма",
    addressLabel: "Кишинёв",
    deliveryRadiusKm: 20,
    minOrderMinor: 100,
    deliveryFeeMinor: 500,
    isActive: true,
    verificationStatus: "verified",
  });
  const product = await ProductModel.create({
    externalId: "product-test",
    storeExternalId: store.externalId,
    storeId: store._id,
    slug: "test",
    title: "Томаты",
    description: "Тестовый товар",
    categoryId: "vegetables",
    priceMinor: 199,
    stock: 10,
    unit: "кг",
    images: ["/product-placeholder.svg"],
    status: "active",
  });
  productId = product.externalId;
});
after(async () => {
  await mongoose.disconnect();
  await replica?.stop();
});

test("checkout validates duplicate items and normalizes phone", () => {
  const value = input();
  assert.equal(
    CheckoutSchema.safeParse({ ...value, items: [...value.items, ...value.items] })
      .success,
    false,
  );
  assert.equal(
    CheckoutSchema.parse({
      ...value,
      customer: { ...value.customer, phone: "+373 (69) 123-456" },
    }).customer.phone,
    "+37369123456",
  );
});

test("checkout is idempotent, rejects changed credentials, and cancellation restores stock once", async () => {
  const value = input();
  const first = await createCheckout(value);
  assert.equal(first[0].totalMinor, 898);
  assert.deepEqual(await createCheckout(value), first);
  assert.equal((await ProductModel.findOne({ externalId: productId }))?.stock, 8);
  await assert.rejects(createCheckout({ ...value, accessToken: "b".repeat(64) }), {
    message: "CHECKOUT_CONFLICT",
  });
  await assert.rejects(
    createCheckout({ ...value, items: [{ productId, quantity: 3 }] }),
    { message: "CHECKOUT_CONFLICT" },
  );
  await assert.rejects(updateOrderStatus(String(owner), first[0].id, "delivered"), {
    message: "INVALID_STATUS_TRANSITION",
  });
  await updateOrderStatus(String(owner), first[0].id, "canceled");
  await assert.rejects(updateOrderStatus(String(owner), first[0].id, "canceled"), {
    message: "INVALID_STATUS_TRANSITION",
  });
  assert.equal((await ProductModel.findOne({ externalId: productId }))?.stock, 10);
});

test("failed minimum-order check rolls stock back", async () => {
  await StoreModel.updateOne({ externalId: "store-test" }, { minOrderMinor: 10000 });
  try {
    await assert.rejects(createCheckout(input()), { message: "MINIMUM_ORDER_NOT_MET" });
  } finally {
    await StoreModel.updateOne({ externalId: "store-test" }, { minOrderMinor: 100 });
  }
  assert.equal((await ProductModel.findOne({ externalId: productId }))?.stock, 10);
});

test("concurrent checkouts cannot oversell", async () => {
  const results = await Promise.allSettled([
    createCheckout({ ...input(), items: [{ productId, quantity: 7 }] }),
    createCheckout({ ...input(), items: [{ productId, quantity: 7 }] }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal((await ProductModel.findOne({ externalId: productId }))?.stock, 3);
});

test("catalog and cart use current prices and hide unverified stores", async () => {
  const catalog = await listProducts({ limit: 100, offset: 0 });
  const cart = summarizeCart([{ productId, quantity: 2 }], catalog.data);
  assert.equal(cart.total, 8.98);
  assert.equal(cart.unavailable.length, 0);
  await StoreModel.updateOne(
    { externalId: "store-test" },
    { verificationStatus: "rejected" },
  );
  const hidden = await listProducts({ limit: 100, offset: 0 });
  assert.equal(hidden.meta.total, 0);
  assert.equal(hidden.data.length, 0);
});

test("registration enforces uniqueness and login rejects incorrect credentials", async () => {
  await UserModel.init();
  const account = {
    username: "test_seller",
    password: "SecurePassword123",
    name: "Продавец",
    accountType: "seller" as const,
  };
  const registered = await register(account);
  assert.deepEqual(registered.user.roles, ["buyer", "seller"]);
  assert.equal((await login(account)).user.id, registered.user.id);
  await assert.rejects(register(account), { message: "USERNAME_TAKEN" });
  await assert.rejects(login({ ...account, password: "WrongPassword123" }), {
    message: "INVALID_CREDENTIALS",
  });
  const created = await createStore(registered.user, {
    name: "Новая ферма",
    description: "Описание нового магазина для проверки регистрации.",
    addressLabel: "Кишинёв",
    deliveryRadiusKm: 20,
    minOrder: 100,
    deliveryFee: 50,
    acceptsCard: false,
  });
  assert.equal(created.status, "pending");
  assert.equal((await StoreModel.findById(created.id))?.location, undefined);
});
