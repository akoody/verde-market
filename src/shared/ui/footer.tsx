import Link from "next/link";
import { Logo } from "@/shared/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-[#dfe6e1] bg-white py-12">
      <div className="container grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#68756f]">
            Фермерские продукты от проверенных хозяйств. Знаете, кто и как вырастил вашу
            еду.
          </p>
        </div>
        <div>
          <b className="text-sm">Покупателям</b>
          <div className="mt-4 grid gap-3 text-sm text-[#68756f]">
            <Link href="/catalog">Каталог</Link>
            <Link href="/account/orders">Мои заказы</Link>
            <Link href="/#how">Доставка и оплата</Link>
          </div>
        </div>
        <div>
          <b className="text-sm">Фермерам</b>
          <div className="mt-4 grid gap-3 text-sm text-[#68756f]">
            <Link href="/seller">Кабинет продавца</Link>
            <Link href="/seller">Стать партнёром</Link>
            <Link href="/seller">Условия работы</Link>
          </div>
        </div>
        <div>
          <b className="text-sm">Поддержка</b>
          <div className="mt-4 grid gap-3 text-sm text-[#68756f]">
            <a href="mailto:hello@verde.market">hello@verde.market</a>
            <span>Ежедневно, 8:00–22:00</span>
          </div>
        </div>
      </div>
      <div className="container mt-10 border-t border-[#edf0ed] pt-6 text-xs text-[#87908b]">
        © 2026 Verde Market · Сделано в Молдове
      </div>
    </footer>
  );
}
