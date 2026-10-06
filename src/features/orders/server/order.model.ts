import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productExternalId: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceMinor: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
const StatusEventSchema = new Schema(
  {
    status: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorType: {
      type: String,
      enum: ["buyer", "seller", "system"],
      required: true,
    },
    at: { type: Date, default: Date.now },
    note: { type: String, maxLength: 500 },
  },
  { _id: false },
);
const OrderSchema = new Schema(
  {
    checkoutId: { type: String, required: true, index: true },
    checkoutFingerprint: String,
    accessTokenHash: {
      type: String,
      required: true,
      index: true,
      select: false,
    },
    number: { type: String, required: true, unique: true, index: true },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true, maxLength: 100 },
      phone: { type: String, required: true, trim: true, maxLength: 20 },
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      validate: (v: unknown[]) => v.length > 0,
    },
    subtotalMinor: { type: Number, required: true, min: 0 },
    deliveryMinor: { type: Number, required: true, min: 0 },
    totalMinor: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "accepted", "packing", "in_transit", "delivered", "canceled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card_on_delivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["due", "paid", "waived"],
      default: "due",
      index: true,
    },
    delivery: {
      address: { type: String, required: true },
      windowStart: Date,
      windowEnd: Date,
      instructions: { type: String, maxLength: 500 },
    },
    statusHistory: { type: [StatusEventSchema], default: [] },
  },
  { timestamps: true, optimisticConcurrency: true },
);
OrderSchema.index({ storeId: 1, createdAt: -1 });
OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ checkoutId: 1, storeId: 1 }, { unique: true });
export type OrderRecord = InferSchemaType<typeof OrderSchema>;
export const OrderModel =
  (models.Order as Model<OrderRecord> | undefined) ??
  model<OrderRecord>("Order", OrderSchema);
