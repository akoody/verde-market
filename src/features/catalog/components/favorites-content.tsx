"use client";
import Link from "next/link";
import { useFavorites } from "../favorites-store";
import { useProducts } from "../use-products";
import { ProductCard } from "./product-card";

export function FavoritesContent() {
  const ids = useFavorites((state) => state.ids);
  const { products, loading, error } = useProducts(ids);
  return (
    <div className="container py-8 md:py-12">
      <h1 className="section-title">Избранное</h1>
      {loading && ids.length > 0 && (
        <p role="status" className="mt-6">
          Загружаем товары…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6">
          {error}
        </p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="mt-6">
          Нет сохранённых товаров в продаже.{" "}
          <Link href="/catalog" className="text-[#2f7d4a]">
            Открыть каталог
          </Link>
        </p>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
