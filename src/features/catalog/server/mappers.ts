import type { ProductRecord } from "./product.model";
import type { StoreRecord } from "@/features/stores/server/store.model";
import type { Farm, Product } from "../types";

export function toProduct(product: ProductRecord, store: StoreRecord): Product {
  return {
    id: product.externalId,
    slug: product.slug,
    title: product.title,
    description: product.description,
    categoryId: product.categoryId,
    image: product.images[0],
    gallery: product.images,
    price: product.priceMinor / 100,
    oldPrice: product.compareAtPriceMinor ? product.compareAtPriceMinor / 100 : undefined,
    unit: product.unit,
    stock: product.stock,
    badge: product.badge ?? undefined,
    farmId: store.externalId,
    farmName: store.name,
    farmMinOrder: store.minOrderMinor / 100,
    farmDeliveryFee: store.deliveryFeeMinor / 100,
    rating: product.rating,
    reviews: product.reviewsCount,
  };
}

export function toFarm(store: StoreRecord): Farm {
  return {
    id: store.externalId,
    slug: store.slug,
    name: store.name,
    location: store.addressLabel,
    description: store.description ?? undefined,
    verified: store.verificationStatus === "verified",
    deliveryLabel: "Доставка по согласованию",
    minOrder: store.minOrderMinor / 100,
    deliveryFee: store.deliveryFeeMinor / 100,
    avatar: store.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
  };
}
