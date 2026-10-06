import { connectDatabase } from "@/shared/server/database";
import { OrderModel } from "./order.model";
import { hashOrderToken } from "../checkout";

export async function trackOrders(token: string) {
  await connectDatabase();
  return OrderModel.find({ accessTokenHash: hashOrderToken(token) })
    .sort({ createdAt: -1 })
    .select(
      "number items subtotalMinor deliveryMinor totalMinor status paymentMethod paymentStatus delivery createdAt",
    )
    .lean();
}
