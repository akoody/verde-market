import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const StoreSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxLength: 120 },
    description: { type: String, maxLength: 3000 },
    location: {
      type: new Schema(
        {
          type: { type: String, enum: ["Point"], required: true },
          coordinates: {
            type: [Number],
            required: true,
            validate: (value: number[]) =>
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90,
          },
        },
        { _id: false },
      ),
      default: undefined,
    },
    addressLabel: { type: String, required: true },
    deliveryRadiusKm: { type: Number, min: 0, required: true },
    minOrderMinor: { type: Number, min: 0, default: 0 },
    deliveryFeeMinor: { type: Number, min: 0, default: 0 },
    paymentMethods: {
      type: [String],
      enum: ["cash_on_delivery", "card_on_delivery"],
      default: ["cash_on_delivery"],
    },
    deliveryDays: { type: [Number], default: [] },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);
StoreSchema.index({ location: "2dsphere" });
export type StoreRecord = InferSchemaType<typeof StoreSchema>;
export const StoreModel =
  (models.Store as Model<StoreRecord> | undefined) ??
  model<StoreRecord>("Store", StoreSchema);
