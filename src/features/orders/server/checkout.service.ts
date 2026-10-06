import { randomBytes } from "node:crypto";
import { connectDatabase } from "@/shared/server/database";
import { AppError } from "@/shared/lib/errors";
import { OrderModel } from "./order.model";
import { ProductModel } from "@/features/catalog/server/product.model";
import { StoreModel } from "@/features/stores/server/store.model";
import { hashOrderToken, checkoutFingerprint } from "../checkout";
import type { CheckoutInput } from "../schemas";

const orderNumber = () =>
  `VM-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

export async function createCheckout(input: CheckoutInput) {
  const database = await connectDatabase();
  const fingerprint = checkoutFingerprint(input);
  const session = await database.startSession();
  let result: Array<{ id: string; number: string; totalMinor: number }> = [];

  try {
    await session.withTransaction(async () => {
      const existing = await OrderModel.find({
        checkoutId: input.checkoutId,
      })
        .select("_id number totalMinor +accessTokenHash checkoutFingerprint")
        .session(session)
        .lean();

      if (existing.length) {
        if (
          existing.some(
            (order) => order.accessTokenHash !== hashOrderToken(input.accessToken),
          )
        ) {
          throw new AppError("CHECKOUT_CONFLICT", 409);
        }
        if (
          existing.some(
            (order) =>
              order.checkoutFingerprint && order.checkoutFingerprint !== fingerprint,
          )
        ) {
          throw new AppError("CHECKOUT_CONFLICT", 409);
        }
        result = existing.map((order) => ({
          id: String(order._id),
          number: order.number,
          totalMinor: order.totalMinor,
        }));
        return;
      }

      const productIds = input.items.map((item) => item.productId);
      const dbProducts = await ProductModel.find({
        externalId: { $in: productIds },
      })
        .session(session)
        .lean();

      if (dbProducts.length !== productIds.length) {
        throw new AppError("PRODUCT_NOT_FOUND", 404);
      }

      const requestedById = new Map(
        input.items.map((item) => [item.productId, item.quantity]),
      );

      for (const product of dbProducts) {
        if (product.status !== "active") throw new AppError("PRODUCT_UNAVAILABLE", 409);
        if (product.stock < (requestedById.get(product.externalId) ?? 0)) {
          throw new AppError("INSUFFICIENT_STOCK", 409);
        }
      }

      const stockResult = await ProductModel.bulkWrite(
        dbProducts.map((product) => ({
          updateOne: {
            filter: {
              _id: product._id,
              status: "active",
              stock: { $gte: requestedById.get(product.externalId) ?? 0 },
            },
            update: {
              $inc: { stock: -(requestedById.get(product.externalId) ?? 0) },
            },
          },
        })),
        { session },
      );

      if (stockResult.modifiedCount !== dbProducts.length) {
        throw new AppError("INSUFFICIENT_STOCK", 409);
      }

      const byStore = new Map<string, typeof dbProducts>();
      for (const product of dbProducts) {
        const key = String(product.storeId);
        byStore.set(key, [...(byStore.get(key) ?? []), product]);
      }

      const stores = await StoreModel.find({
        _id: { $in: [...byStore.keys()] },
      })
        .session(session)
        .lean();
      const storesById = new Map(stores.map((store) => [String(store._id), store]));
      if (stores.length !== byStore.size) throw new AppError("STORE_UNAVAILABLE", 409);

      for (const [storeId, storeProducts] of byStore) {
        const store = storesById.get(storeId);
        if (!store?.isActive || store.verificationStatus !== "verified") {
          throw new AppError("STORE_UNAVAILABLE", 409);
        }
        if (!store.paymentMethods.includes(input.paymentMethod)) {
          throw new AppError("PAYMENT_METHOD_UNAVAILABLE", 409);
        }
        const subtotalMinor = storeProducts.reduce(
          (sum, product) =>
            sum + product.priceMinor * (requestedById.get(product.externalId) ?? 0),
          0,
        );
        if (subtotalMinor < store.minOrderMinor) {
          throw new AppError("MINIMUM_ORDER_NOT_MET", 409);
        }
      }

      const created = await OrderModel.create(
        [...byStore.entries()].map(([storeId, storeProducts]) => {
          const store = storesById.get(storeId);
          if (!store) throw new AppError("STORE_UNAVAILABLE", 409);
          const items = storeProducts.map((product) => ({
            productId: product._id,
            productExternalId: product.externalId,
            title: product.title,
            image: product.images[0],
            unit: product.unit,
            quantity: requestedById.get(product.externalId),
            priceMinor: product.priceMinor,
          }));
          const subtotalMinor = items.reduce(
            (sum, item) => sum + item.priceMinor * (item.quantity ?? 0),
            0,
          );
          return {
            checkoutId: input.checkoutId,
            checkoutFingerprint: fingerprint,
            accessTokenHash: hashOrderToken(input.accessToken),
            number: orderNumber(),
            storeId,
            customer: input.customer,
            items,
            subtotalMinor,
            deliveryMinor: store.deliveryFeeMinor,
            totalMinor: subtotalMinor + store.deliveryFeeMinor,
            paymentMethod: input.paymentMethod,
            paymentStatus: "due",
            delivery: input.delivery,
            status: "pending",
            statusHistory: [{ status: "pending", actorType: "system" }],
          };
        }),
        { session },
      );

      result = created.map((order) => ({
        id: String(order._id),
        number: order.number,
        totalMinor: order.totalMinor,
      }));
    });
  } finally {
    await session.endSession();
  }

  return result;
}
