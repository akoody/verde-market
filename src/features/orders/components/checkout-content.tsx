"use client";
import { useProducts } from "@/features/catalog/use-products";
import { saveOrderToken } from "@/features/orders/token-storage";
import { summarizeCart } from "@/features/cart/summary";
import { useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, CreditCard, MapPin, ShieldCheck } from "lucide-react";

import { formatMoney } from "@/shared/lib/format";
import { useCart } from "@/features/cart/store";

export function CheckoutContent() {
  const lines = useCart((s) => s.lines);
  const {
    products: catalogProducts,
    loading: catalogLoading,
    error: catalogError,
  } = useProducts(lines.map((line) => line.productId));
  const { unavailable, subtotal, farmIds, deliveryTotal, farmsBelowMinimum, total } =
    summarizeCart(lines, catalogProducts);
  const clear = useCart((s) => s.clear);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash_on_delivery" | "card_on_delivery"
  >("cash_on_delivery");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const checkoutId = useRef(crypto.randomUUID());
  const accessToken = useRef(
    Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join(""),
  );
  const farmCount = farmIds.length;
  if (catalogLoading && lines.length)
    return (
      <div className="container py-24" role="status">
        Загружаем заказ…
      </div>
    );
  if (catalogError)
    return (
      <div className="container py-24" role="alert">
        {catalogError}
      </div>
    );
  if (unavailable.length || farmsBelowMinimum.length)
    return (
      <div className="container py-24">
        <p role="alert">Товары или условия доставки изменились. Проверьте корзину.</p>
        <Link className="button button-primary mt-4" href="/cart">
          В корзину
        </Link>
      </div>
    );
  if (orderNumbers.length)
    return (
      <div className="container py-24 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#2f7d4a] text-white">
          <Check size={38} />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-[-.04em]">Заказ оформлен</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68756f]">
          Мы отправили заказ фермерам. Они подтвердят наличие и время доставки в личном
          кабинете.
        </p>
        <p className="mt-3 text-xs font-bold text-[#2f7d4a]">
          {orderNumbers.join(" · ")}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/account/orders" className="button button-primary">
            Следить за заказом
          </Link>
          <Link href="/catalog" className="button button-secondary">
            В каталог
          </Link>
        </div>
      </div>
    );
  if (!lines.length)
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-extrabold">Нет товаров для оформления</h1>
        <Link href="/catalog" className="button button-primary mt-6">
          В каталог
        </Link>
      </div>
    );
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    try {
      saveOrderToken(accessToken.current);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          checkoutId: checkoutId.current,
          accessToken: accessToken.current,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
          customer: {
            name: form.get("name"),
            phone: form.get("phone"),
          },
          delivery: {
            address: form.get("address"),
            instructions: form.get("instructions") || undefined,
          },
          paymentMethod,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const message =
          payload.error === "INSUFFICIENT_STOCK"
            ? "Некоторых товаров уже нет в нужном количестве. Обновите корзину."
            : payload.error === "MINIMUM_ORDER_NOT_MET"
              ? "Минимальная сумма одного из магазинов не достигнута. Вернитесь в корзину."
              : payload.error === "PAYMENT_METHOD_UNAVAILABLE"
                ? "Один из фермеров не поддерживает выбранный способ оплаты."
                : payload.error === "VALIDATION_ERROR"
                  ? "Проверьте имя, молдавский номер телефона и адрес доставки."
                  : "Не удалось оформить заказ. Попробуйте ещё раз чуть позже.";
        throw new Error(message);
      }
      clear();
      setOrderNumbers(
        payload.data.orders.map((order: { number: string }) => order.number),
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Не удалось оформить заказ.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={submit} className="container py-8 md:py-12">
      <div className="flex items-center gap-2 text-xs text-[#7a857f]">
        <Link href="/cart">Корзина</Link>
        <ChevronRight size={14} />
        <span>Оформление</span>
      </div>
      <h1 className="section-title mt-4">Оформление заказа</h1>
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#edf5ef] text-[#2f7d4a]">
                <MapPin size={20} />
              </span>
              <h2 className="text-lg font-extrabold">Куда доставить</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold">
                Имя
                <input className="input mt-2" required name="name" autoComplete="name" />
              </label>
              <label className="text-xs font-bold">
                Телефон
                <input
                  className="input mt-2"
                  required
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+373 69 123 456"
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                Адрес
                <input
                  className="input mt-2"
                  required
                  name="address"
                  autoComplete="street-address"
                  placeholder="Город, улица, дом, квартира"
                />
              </label>
              <label className="text-xs font-bold sm:col-span-2">
                Комментарий курьеру
                <textarea
                  className="input mt-2 min-h-24 py-3"
                  name="instructions"
                  placeholder="Код домофона, ориентир..."
                />
              </label>
            </div>
          </section>
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#edf5ef] text-[#2f7d4a]">
                <CreditCard size={20} />
              </span>
              <h2 className="text-lg font-extrabold">Оплата</h2>
            </div>
            <label
              className={`mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${paymentMethod === "cash_on_delivery" ? "border-[#2f7d4a]" : "border-[#dfe6e1]"}`}
            >
              <input
                type="radio"
                checked={paymentMethod === "cash_on_delivery"}
                onChange={() => setPaymentMethod("cash_on_delivery")}
                name="paymentMethod"
                className="accent-[#2f7d4a]"
              />
              <span>
                <b className="block text-sm">Наличными при получении</b>
                <span className="text-xs text-[#758079]">
                  Оплатите заказ фермеру при встрече
                </span>
              </span>
            </label>
            <label
              className={`mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${paymentMethod === "card_on_delivery" ? "border-[#2f7d4a]" : "border-[#dfe6e1]"}`}
            >
              <input
                type="radio"
                checked={paymentMethod === "card_on_delivery"}
                onChange={() => setPaymentMethod("card_on_delivery")}
                name="paymentMethod"
                className="accent-[#2f7d4a]"
              />
              <span>
                <b className="block text-sm">Картой при получении</b>
                <span className="text-xs text-[#758079]">
                  Фермер привезёт мобильный терминал
                </span>
              </span>
            </label>
          </section>
        </div>
        <aside className="card sticky top-28 p-6">
          <h2 className="text-xl font-extrabold">Ваш заказ</h2>
          <p className="mt-1 text-xs text-[#758079]">
            {lines.length} позиций · {farmCount} {farmCount === 1 ? "фермер" : "фермера"}
          </p>
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
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-[#fff0ed] p-3 text-xs leading-5 text-[#a04431]"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="button button-primary mt-6 w-full disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Оформляем…" : "Подтвердить заказ"}
          </button>
          <p className="mt-4 flex gap-2 text-[11px] leading-5 text-[#6b7770]">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#2f7d4a]" />
            Нажимая кнопку, вы соглашаетесь с условиями оферты и политикой
            конфиденциальности.
          </p>
        </aside>
      </div>
    </form>
  );
}
