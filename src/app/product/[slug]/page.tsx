import { FavoriteButton } from "@/features/catalog/components/favorite-button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  Leaf,
  MapPin,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { getProductDetail } from "@/features/catalog/server/queries";
import { formatMoney } from "@/shared/lib/format";
import { AddToCart } from "@/features/cart/components/add-to-cart";
import { ProductCard } from "@/features/catalog/components/product-card";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) notFound();
  const { product, farm, related } = detail;
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6 flex items-center gap-2 text-xs text-[#7a857f]">
        <Link href="/">Главная</Link>
        <ChevronRight size={13} />
        <Link href="/catalog">Каталог</Link>
        <ChevronRight size={13} />
        <span className="truncate">{product.title}</span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef2ee]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority
            sizes="(max-width:1024px) 100vw,50vw"
            className="object-cover"
          />
          {product.badge && (
            <span className="absolute left-5 top-5 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-[#2f7d4a]">
              {product.badge}
            </span>
          )}
          <FavoriteButton
            productId={product.id}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-white text-[#2f7d4a]"
          />
        </div>
        <div className="lg:py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-bold">
              <Star size={14} fill="#f4bb3b" strokeWidth={0} />
              {product.rating}
            </span>
            <span className="text-[#7a857f]">{product.reviews} отзывов</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.045em] md:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 leading-7 text-[#66746d]">{product.description}</p>
          <div className="mt-6 flex items-baseline gap-3">
            <b className="text-3xl tracking-[-.04em]">{formatMoney(product.price)}</b>
            <span className="text-sm text-[#7a857f]">за {product.unit}</span>
            {product.oldPrice && (
              <del className="text-sm text-[#99a19d]">
                {formatMoney(product.oldPrice)}
              </del>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <AddToCart productId={product.id} stock={product.stock} />
            <span className="text-xs text-[#6b7770]">
              В наличии: {product.stock} {product.unit}
            </span>
          </div>
          <div className="mt-7 grid gap-3 border-y border-[#e3e8e4] py-5 text-sm">
            <div className="flex items-center gap-3">
              <Truck size={19} className="text-[#2f7d4a]" />
              <div>
                <b>{farm.deliveryLabel}</b>
                <span className="ml-2 text-xs text-[#7a857f]">
                  {farm.deliveryFee ? `от ${formatMoney(farm.deliveryFee)}` : "бесплатно"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={19} className="text-[#2f7d4a]" />
              <div>
                <b>Безопасная оплата</b>
                <span className="ml-2 text-xs text-[#7a857f]">
                  Оплата продавцу при получении
                </span>
              </div>
            </div>
          </div>
          <div className="card mt-6 !shadow-none p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-[#dcef78] font-extrabold">
                {farm.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold">
                  {farm.name}
                  <BadgeCheck size={16} className="text-[#2f7d4a]" />
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#758079]">
                  <MapPin size={12} />
                  {farm.location}
                  {(farm.distanceKm ?? 0) > 0 ? ` · ${farm.distanceKm} км` : ""}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-5 text-xs">
              {farm.rating !== undefined && <span>★ {farm.rating} рейтинг</span>}
              {farm.reviews !== undefined && <span>{farm.reviews} отзывов</span>}
              <span>Заказ от {formatMoney(farm.minOrder)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-14 rounded-xl bg-[#f1f5ef] p-6 md:grid md:grid-cols-3 md:gap-6">
        <div className="flex gap-3">
          <Leaf className="text-[#2f7d4a]" />
          <div>
            <b className="text-sm">Честный состав</b>
            <p className="mt-1 text-xs leading-5 text-[#69766f]">
              Без скрытых добавок и непонятного происхождения.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3 md:mt-0">
          <BadgeCheck className="text-[#2f7d4a]" />
          <div>
            <b className="text-sm">Ферма проверена</b>
            <p className="mt-1 text-xs leading-5 text-[#69766f]">
              Магазин допущен к продажам после модерации.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3 md:mt-0">
          <Truck className="text-[#2f7d4a]" />
          <div>
            <b className="text-sm">Доставка продавцом</b>
            <p className="mt-1 text-xs leading-5 text-[#69766f]">
              Продукты не лежат на промежуточном складе.
            </p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="section !pb-4">
          <h2 className="section-title">Похожие продукты</h2>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
