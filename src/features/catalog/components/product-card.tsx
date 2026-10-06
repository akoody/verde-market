"use client";
import { FavoriteButton } from "@/features/catalog/components/favorite-button";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Plus, Star } from "lucide-react";
import { formatMoney } from "@/shared/lib/format";
import { useCart } from "@/features/cart/store";
import type { Product } from "@/features/catalog/types";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const quantity = useCart(
    (s) => s.lines.find((l) => l.productId === product.id)?.quantity ?? 0,
  );
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[1/1.05] overflow-hidden rounded-xl bg-[#eef2ee]">
        <Link href={`/product/${product.slug}`} className="relative block size-full">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width:720px) 50vw,25vw"
            className="object-cover "
          />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-[#235f3b] shadow-sm">
            {product.badge}
          </span>
        )}
        <FavoriteButton
          productId={product.id}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-white text-[#2f7d4a]"
        />
      </div>
      <div className="pt-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <b className="text-[18px] tracking-[-.03em]">{formatMoney(product.price)}</b>
          <span className="text-xs text-[#7a857f]">/ {product.unit}</span>
          {product.oldPrice && (
            <del className="text-xs text-[#9ca49f]">{formatMoney(product.oldPrice)}</del>
          )}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1.5 block min-h-[44px] text-[14px] font-semibold leading-[1.45] hover:text-[#2f7d4a]"
        >
          {product.title}
        </Link>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-[#758079]">
          <span className="flex items-center gap-1 text-[#344c40]">
            <Star size={12} fill="#f4bb3b" strokeWidth={0} />
            {product.rating}
          </span>
          <span>·</span>
          <span>{product.reviews} отзывов</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-[#758079]">
          <CheckCircle2 size={13} className="text-[#2f7d4a]" />
          {product.farmName}
        </div>
        <button
          onClick={() => add(product.id)}
          disabled={quantity >= product.stock}
          className="button button-ghost mt-3 w-full !min-h-10 !rounded-xl !px-3 text-sm"
        >
          <Plus size={17} />
          {product.stock === 0
            ? "Нет в наличии"
            : quantity
              ? `В корзине · ${quantity}`
              : "В корзину"}
        </button>
      </div>
    </article>
  );
}
