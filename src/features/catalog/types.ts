export type Category = {
  id: string;
  name: string;
  emoji: string;
};

export type Farm = {
  id: string;
  slug: string;
  name: string;
  location: string;
  description?: string;
  distanceKm?: number;
  rating?: number;
  reviews?: number;
  verified: boolean;
  deliveryLabel: string;
  minOrder: number;
  deliveryFee?: number;
  avatar: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  image: string;
  gallery?: string[];
  price: number;
  oldPrice?: number;
  unit: string;
  stock: number;
  badge?: string;
  farmId: string;
  farmName?: string;
  farmMinOrder?: number;
  farmDeliveryFee?: number;
  rating: number;
  reviews: number;
};
