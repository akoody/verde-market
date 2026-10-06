"use client";
import { useProducts } from "@/features/catalog/use-products";
import { summarizeCart } from "@/features/cart/summary";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
  Truck,
} from "lucide-react";

import { formatMoney } from "@/shared/lib/format";
import { useCart } from "@/features/cart/store";

export function CartContent() {
  const lines = useCart((s) => s.lines);
  const {
    products: catalogProducts,
    loading: catalogLoading,
    error: catalogError,
  } = useProducts(lines.map((line) => line.productId));
  const {
    items,
    unavailable,
    subtotal,
    farmIds,
    deliveryTotal,
    farmsBelowMinimum,
    total,
  } = summarizeCart(lines, catalogProducts);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  if (catalogLoading && lines.length)
    return (
      <div className="container py-24" role="status">
        Загружаем корзину…
      </div>
    );
  if (catalogError)
    return (
      <div className="container py-24" role="alert">
        {catalogError}
      </div>
    );
  if (!lines.length)
    return (
      <div className="container py-24 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#edf5ef] text-[#2f7d4a]">
          <ShoppingBasket size={34} />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-[-.04em]">
          Корзина пока пуста
        </h1>
        <p className="mt-3 text-sm text-[#6c7871]">
          Добавьте свежие продукты от фермеров рядом с вами.
        </p>
        <Link href="/catalog" className="button button-primary mt-7">
          Перейти в каталог
        </Link>
      </div>
    );
  return (
    <div className="container py-8 md:py-12">
      <h1 className="section-title">Корзина</h1>
      <p className="mt-2 text-sm text-[#6d7972]">
        Заказы разных продавцов оформятся отдельно
      </p>
      {unavailable.length > 0 && (
        <div role="alert" className="mt-4 text-sm">
          Некоторые товары недоступны или их осталось меньше, чем в корзине. Измените
          количество или удалите их.
          {unavailable.map((line) => (
            <button
              key={line.productId}
              type="button"
              onClick={() => remove(line.productId)}
              className="button button-secondary ml-2"
            >
              Удалить{" "}
              {catalogProducts.find((product) => product.id === line.productId)?.title ??
                "недоступный товар"}
            </button>
          ))}
        </div>
      )}
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          {farmIds.map((farmId) => {
            const group = items.filter((x) => x.product.farmId === farmId);
            const firstProduct = group[0].product;
            const farm = {
              id: farmId,
              name: firstProduct.farmName ?? "Фермерский магазин",
              avatar: (firstProduct.farmName ?? "ФМ").slice(0, 2).toUpperCase(),
              deliveryLabel: "Доставка по согласованию",
              minOrder: firstProduct.farmMinOrder ?? 0,
            };
            return (
              <section key={farmId} className="card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-[#edf0ed] px-5 py-4">
                  <span className="grid size-9 place-items-center rounded-full bg-[#dcef78] text-xs font-extrabold">
                    {farm.avatar}
                  </span>
                  <div>
                    <b className="text-sm">{farm.name}</b>
                    <p className="text-[11px] text-[#758079]">
                      {farm.deliveryLabel} · заказ от {formatMoney(farm.minOrder)}
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-[#edf0ed]">
                  {group.map(({ line, product }) => (
                    <div key={product.id} className="flex gap-4 p-4 md:p-5">
                      <Link
                        href={`/product/${product.slug}`}
                        className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-[#eef2ee]"
                      >
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-sm font-bold leading-5"
                        >
                          {product.title}
                        </Link>
                        <p className="mt-1 text-xs text-[#7a857f]">
                          {formatMoney(product.price)} / {product.unit}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex h-9 items-center rounded-lg bg-[#f0f4f1]">
                            <button
                              onClick={() => setQuantity(product.id, line.quantity - 1)}
                              aria-label="Уменьшить количество"
                              className="grid h-full w-9 place-items-center"
                            >
                              <Minus size={14} />
                            </button>
                            <b className="min-w-7 text-center text-sm">{line.quantity}</b>
                            <button
                              onClick={() =>
                                setQuantity(
                                  product.id,
                                  Math.min(product.stock, line.quantity + 1),
                                )
                              }
                              aria-label="Увеличить количество"
                              disabled={line.quantity >= product.stock}
                              className="grid h-full w-9 place-items-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <b className="text-sm">
                              {formatMoney(product.price * line.quantity)}
                            </b>
                            <button
                              onClick={() => remove(product.id)}
                              className="text-[#91a098]"
                              aria-label="Удалить"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <aside className="card sticky top-28 p-6">
          <h2 className="text-xl font-extrabold">Итого</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6d7972]">Товары</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6d7972]">Доставка</span>
              <span>{formatMoney(deliveryTotal)}</span>
            </div>
          </div>
          <div className="my-5 border-t border-[#e3e8e4]" />
          <div className="flex items-end justify-between">
            <b>К оплате</b>
            <b className="text-2xl tracking-[-.04em]">{formatMoney(total)}</b>
          </div>
          {farmsBelowMinimum.length ? (
            <div className="mt-5 rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#755619]">
              {farmsBelowMinimum.map(({ farm, missing }) => (
                <p key={farm.id}>
                  Добавьте товары от «{farm.name}» ещё на {formatMoney(missing)}.
                </p>
              ))}
            </div>
          ) : !unavailable.length ? (
            <Link href="/checkout" className="button button-primary mt-6 w-full">
              Оформить заказ <ArrowRight size={18} />
            </Link>
          ) : null}
          <div className="mt-5 grid gap-3 text-xs text-[#6b7770]">
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#2f7d4a]" />
              Оплата наличными или картой при получении
            </span>
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-[#2f7d4a]" />
              Доставляет каждый фермер отдельно
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
