"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  Search,
  ShoppingBasket,
  UserRound,
} from "lucide-react";
import { Logo } from "@/shared/ui/logo";
import { useCart } from "@/features/cart/store";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const count = useCart((state) =>
    state.lines.reduce((sum, line) => sum + line.quantity, 0),
  );
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e2e8e3] bg-white">
        <div className="container flex h-[76px] items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            <Link href="/catalog" className="hover:text-[#2f7d4a]">
              Каталог
            </Link>
            <Link href="/#farms" className="hover:text-[#2f7d4a]">
              Фермеры
            </Link>
            <Link href="/#how" className="hover:text-[#2f7d4a]">
              Как это работает
            </Link>
          </nav>
          <Link
            href="/catalog"
            className="ml-auto hidden min-w-[260px] items-center gap-2 rounded-xl bg-[#f3f5f3] px-4 py-3 text-sm text-[#6d7972] md:flex"
          >
            <Search size={18} />
            Найти продукты или ферму
          </Link>
          <span className="hidden items-center gap-2 text-sm font-semibold xl:flex">
            <MapPin size={18} className="text-[#2f7d4a]" />
            Молдова
          </span>
          <Link
            href="/seller"
            className="hidden rounded-xl border border-[#cfd8d1] px-4 py-2.5 text-sm font-bold lg:block"
          >
            Для фермеров
          </Link>
          <Link href="/login" aria-label="Личный кабинет" className="ml-auto md:ml-0">
            <UserRound size={22} />
          </Link>
          <Link
            href="/cart"
            className="relative"
            aria-label={`Корзина, товаров: ${count}`}
          >
            <ShoppingBasket size={24} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#2f7d4a] text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden"
            aria-label="Открыть меню"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu />
          </button>
        </div>
        {isMenuOpen && (
          <div className="absolute left-0 top-[76px] w-full border-b border-[#e2e8e3] bg-white px-5 pb-6 pt-4 shadow-sm lg:hidden">
            <nav className="flex flex-col gap-5 text-base font-semibold text-[#173027]">
              <Link
                href="/catalog"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-[#2f7d4a]"
              >
                Каталог
              </Link>
              <Link
                href="/#farms"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-[#2f7d4a]"
              >
                Фермеры
              </Link>
              <Link
                href="/#how"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-[#2f7d4a]"
              >
                Как это работает
              </Link>
              <Link
                href="/seller"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-[#2f7d4a]"
              >
                Для фермеров
              </Link>
              <div className="my-2 h-px bg-[#e2e8e3]" />
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 hover:text-[#2f7d4a]"
              >
                <UserRound size={18} />
                Войти в кабинет
              </Link>
            </nav>
          </div>
        )}
      </header>
      <nav className="fixed bottom-0 left-0 z-50 grid h-[66px] w-full grid-cols-4 border-t border-[#dfe6e1] bg-white md:hidden">
        <Link
          href="/catalog"
          className="grid place-items-center text-[10px] font-semibold"
        >
          <span className="flex flex-col items-center gap-1">
            <Search size={20} />
            Каталог
          </span>
        </Link>
        <Link
          href="/favorites"
          className="grid place-items-center text-[10px] font-semibold"
        >
          <span className="flex flex-col items-center gap-1">
            <Heart size={20} />
            Избранное
          </span>
        </Link>
        <Link href="/cart" className="grid place-items-center text-[10px] font-semibold">
          <span className="relative flex flex-col items-center gap-1">
            <ShoppingBasket size={20} />
            Корзина
            {count > 0 && (
              <i className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#2f7d4a] text-[9px] not-italic text-white">
                {count}
              </i>
            )}
          </span>
        </Link>
        <Link
          href="/account/orders"
          className="grid place-items-center text-[10px] font-semibold"
        >
          <span className="flex flex-col items-center gap-1">
            <LayoutDashboard size={20} />
            Заказы
          </span>
        </Link>
      </nav>
    </>
  );
}
