import { connectDatabase } from "@/shared/server/database";
import { StoreModel } from "./store.model";
import { OrderModel } from "@/features/orders/server/order.model";
import { ProductModel } from "@/features/catalog/server/product.model";

export async function getSellerDashboard(sellerId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ ownerId: sellerId }).lean();
  if (!store) return null;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [recentOrders, newOrders, activeProducts, lowProducts, revenue] =
    await Promise.all([
      OrderModel.find({ storeId: store._id })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("number customer delivery totalMinor status createdAt")
        .lean(),
      OrderModel.countDocuments({ storeId: store._id, status: "pending" }),
      ProductModel.countDocuments({
        storeId: store._id,
        status: { $ne: "archived" },
      }),
      ProductModel.find({
        storeId: store._id,
        status: { $ne: "archived" },
        stock: { $lte: 5 },
      })
        .sort({ stock: 1 })
        .limit(5)
        .select("title images stock unit")
        .lean(),
      OrderModel.aggregate<{ total: number }>([
        {
          $match: {
            storeId: store._id,
            status: "delivered",
            updatedAt: { $gte: startOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalMinor" } } },
      ]),
    ]);
  return {
    store,
    recentOrders,
    newOrders,
    activeProducts,
    lowProducts,
    revenueMinor: revenue[0]?.total ?? 0,
  };
}
