"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Truck } from "lucide-react";
import { categories } from "@/features/catalog/categories";
import type { Product, Farm } from "../types";
import { ProductCard } from "./product-card";

export function HomeContent({ products, farms }: { products: Product[]; farms: Farm[] }) {
  const [category, setCategory] = useState("all");
  const visible = useMemo(
    () =>
      category === "all" ? products : products.filter((p) => p.categoryId === category),
    [category, products],
  );
  return (
    <>
      <section className="overflow-hidden bg-[#eff4eb] py-8 md:py-14">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 py-3 md:py-10">
            <h1 className="mt-4 max-w-[700px] text-[42px] font-extrabold leading-[1.02] tracking-[-.055em] sm:text-[58px] lg:text-[70px]">
              Свежее — значит <span className="text-[#2f7d4a]">рядом</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5a6d62] md:text-lg">
              Покупайте овощи, молочные продукты, мясо и хлеб напрямую у проверенных
              фермеров вашего региона.
            </p>
            <Link
              href="/catalog"
              className="mt-7 flex max-w-[610px] items-center gap-3 rounded-2xl bg-white p-2 pl-5 border border-[#dfe6e1]"
            >
              <Search className="text-[#2f7d4a]" />
              <span className="flex-1 text-sm text-[#7e8983]">Что хотите найти?</span>
              <span className="button button-primary !min-h-12 !rounded-xl">Найти</span>
            </Link>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#5c6d63]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#2f7d4a]" />
                Проверенные хозяйства
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={16} className="text-[#2f7d4a]" />
                Доставка от фермера
              </span>
            </div>
          </div>
          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute inset-5 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=90"
                alt="Свежие фермерские овощи"
                fill
                priority
                sizes="45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="section !pb-5">
        <div className="container">
          <div className="flex items-end justify-between gap-5">
            <div>
              <h2 className="section-title mt-2">Что привезти?</h2>
            </div>
            <Link
              href="/catalog"
              className="hidden items-center gap-2 text-sm font-bold text-[#2f7d4a] md:flex"
            >
              Весь каталог <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-7 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none]">
            <button
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-2xl border px-5 py-4 text-sm font-bold ${category === "all" ? "border-[#2f7d4a] bg-[#2f7d4a] text-white" : "border-[#e2e7e3] bg-white"}`}
            >
              Все продукты
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-5 py-4 text-sm font-bold ${category === item.id ? "border-[#2f7d4a] bg-[#2f7d4a] text-white" : "border-[#e2e7e3] bg-white"}`}
              >
                <span className="text-xl">{item.emoji}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="section !pt-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
      <section id="farms" className="section bg-[#173027] text-white">
        <div className="container">
          <h2 className="section-title mt-2 max-w-2xl">
            Знакомьтесь с теми, кто выращивает вашу еду
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {farms.map((farm) => (
              <article
                key={farm.id}
                className="rounded-xl bg-white/8 p-5 ring-1 ring-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="grid size-14 place-items-center rounded-full bg-[#dcef78] font-extrabold text-[#173027]">
                    {farm.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold">
                      {farm.name}
                      <BadgeCheck size={17} className="text-[#dcef78]" />
                    </div>
                    <span className="text-xs text-white/60">{farm.location}</span>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/70">{farm.description}</p>
                <p className="mt-4 text-xs">
                  Заказ от {farm.minOrder} MDL · {farm.deliveryLabel}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="how" className="section">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title mt-2">От фермы до вашего стола</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [
                Search,
                "Выбираете продукты",
                "Сравнивайте ассортимент, условия доставки и отзывы о хозяйствах.",
              ],
              [
                BadgeCheck,
                "Фермер подтверждает",
                "Продавец проверяет наличие, собирает заказ и назначает доставку.",
              ],
              [
                Truck,
                "Получаете свежим",
                "Продавец привозит заказ и вы наслаждаетесь свежими продуктами.",
              ],
            ].map(([Icon, title, text], index) => {
              const StepIcon = Icon as typeof Search;
              return (
                <article key={String(title)} className="card relative p-7">
                  <span className="absolute right-5 top-4 text-5xl font-black text-[#edf3ee]">
                    0{index + 1}
                  </span>
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#edf6ef] text-[#2f7d4a]">
                    <StepIcon />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#68756f]">{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="pb-20">
        <div className="container rounded-xl bg-[#dcef78] p-7 md:flex md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-.04em] md:text-4xl">
              Выращиваете продукты?
            </h2>
            <p className="mt-2 text-sm text-[#42543f] md:text-base">
              Откройте магазин и начните принимать заказы от покупателей рядом.
            </p>
          </div>
          <Link href="/seller" className="button mt-6 bg-[#173027] text-white md:mt-0">
            Стать продавцом <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
