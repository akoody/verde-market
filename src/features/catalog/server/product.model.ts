import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ProductSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    storeExternalId: { type: String, required: true, index: true },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxLength: 180 },
    description: { type: String, required: true, maxLength: 5000 },
    categoryId: { type: String, required: true, index: true },
    priceMinor: { type: Number, required: true, min: 0 },
    compareAtPriceMinor: { type: Number, min: 0 },
    unit: { type: String, required: true, maxLength: 30 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], validate: (value: string[]) => value.length > 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, min: 0, default: 0 },
    badge: { type: String, maxLength: 40 },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true, optimisticConcurrency: true },
);

ProductSchema.index({ title: "text", description: "text" });
export type ProductRecord = InferSchemaType<typeof ProductSchema>;
export const ProductModel =
  (models.Product as Model<ProductRecord> | undefined) ??
  model<ProductRecord>("Product", ProductSchema);
