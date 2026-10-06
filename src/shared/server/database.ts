import mongoose from "mongoose";
type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: Cache;
};
const cache = globalWithMongoose.mongooseCache ?? { conn: null, promise: null };
globalWithMongoose.mongooseCache = cache;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 20,
    minPoolSize: process.env.NODE_ENV === "production" ? 2 : 0,
    serverSelectionTimeoutMS: 5_000,
    autoIndex: process.env.NODE_ENV !== "production",
  });
  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.conn = null;
    cache.promise = null;
    throw error;
  }
}
