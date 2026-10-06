import { connectDatabase } from "@/shared/server/database";
import { AppError } from "@/shared/lib/errors";
import { OrderModel } from "./order.model";
import { ProductModel } from "@/features/catalog/server/product.model";
import { StoreModel } from "@/features/stores/server/store.model";
import { canTransitionOrder } from "../status";
import type { OrderStatus } from "../types";

export async function updateOrderStatus(
  sellerId: string,
  id: string,
  status: OrderStatus,
) {
  const database = await connectDatabase();
  const store = await StoreModel.findOne({ ownerId: sellerId }).select("_id").lean();
  if (!store) throw new AppError("STORE_REQUIRED", 409);
  const session = await database.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await OrderModel.findOne({
        _id: id,
        storeId: store._id,
      }).session(session);
      if (!order) throw new AppError("ORDER_NOT_FOUND", 404);
      if (!canTransitionOrder(order.status, status)) {
        throw new AppError("INVALID_STATUS_TRANSITION", 409);
      }
      if (status === "canceled") {
        await ProductModel.bulkWrite(
          order.items.map((item: { productId: unknown; quantity: number }) => ({
            updateOne: {
              filter: { _id: item.productId },
              update: { $inc: { stock: item.quantity } },
            },
          })),
          { session },
        );
      }
      order.status = status;
      if (status === "delivered") order.paymentStatus = "paid";
      order.statusHistory.push({
        status: status,
        actorId: sellerId,
        actorType: "seller",
        at: new Date(),
      });
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
}
