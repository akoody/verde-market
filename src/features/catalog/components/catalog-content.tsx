"use client";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { categories } from "@/features/catalog/categories";
import { useProducts } from "@/features/catalog/use-products";
import { ProductCard } from "@/features/catalog/components/product-card";

export function CatalogContent() {
  const { products: catalogProducts, loading, error } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const visible = useMemo(
    () =>
      catalogProducts.filter(
        (p) =>
          (category === "all" || p.categoryId === category) &&
          p.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [catalogProducts, query, category],
  );
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title mt-2">Каталог продуктов</h1>
          <p className="mt-2 text-sm text-[#6d7972]">
            {visible.length} свежих предложений с доставкой в ваш район
          </p>
        </div>
        <span className="flex items-center gap-2 text-sm">
          <MapPin size={17} className="text-[#2f7d4a]" />
          Молдова
        </span>
      </div>
      <div className="mt-7 flex gap-3">
        <label className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-[#dfe6e1] bg-white px-5">
          <Search size={20} className="text-[#78837d]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Томаты, молоко, сыр..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        <button
          onClick={() => setCategory("all")}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold ${category === "all" ? "bg-[#173027] text-white" : "bg-[#eef3ef]"}`}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold ${category === c.id ? "bg-[#173027] text-white" : "bg-[#eef3ef]"}`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>
      {loading && (
        <p role="status" className="mt-8">
          Загружаем товары…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-8">
          {error}
        </p>
      )}
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!loading && !error && visible.length === 0 && (
        <div className="py-24 text-center">
          <div className="text-5xl">🌱</div>
          <h2 className="mt-4 text-xl font-bold">Ничего не нашлось</h2>
          <p className="mt-2 text-sm text-[#6d7972]">
            Попробуйте изменить запрос или выбрать другую категорию.
          </p>
        </div>
      )}
    </div>
  );
}
