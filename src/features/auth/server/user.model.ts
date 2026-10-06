import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 32,
    },
    passwordHash: { type: String, required: true, select: false },
    phoneE164: { type: String, sparse: true, index: true },
    name: { type: String, trim: true, maxLength: 100 },
    roles: {
      type: [String],
      enum: ["buyer", "seller", "admin"],
      default: ["buyer"],
    },
    avatarUrl: String,
    authVersion: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);
export type UserRecord = InferSchemaType<typeof UserSchema>;
export const UserModel =
  (models.User as Model<UserRecord> | undefined) ?? model<UserRecord>("User", UserSchema);
