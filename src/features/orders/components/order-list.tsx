"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock3, PackageCheck, ShoppingBasket, Truck } from "lucide-react";
import { formatMoney } from "@/shared/lib/format";

type TrackedOrder = {
  _id: string;
  number: string;
  status: "pending" | "accepted" | "packing" | "in_transit" | "delivered" | "canceled";
  paymentMethod: "cash_on_delivery" | "card_on_delivery";
  totalMinor: number;
  createdAt: string;
  delivery: { address: string };
  items: Array<{
    title: string;
    image: string;
    quantity: number;
    unit: string;
  }>;
};

import { orderStatusLabels } from "../status";
import { readOrderTokens } from "../token-storage";

export function OrderList() {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const tokens = readOrderTokens();
    Promise.all(
      tokens.map((token) =>
        fetch("/api/orders/track", {
          signal: controller.signal,
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        })
          .then((response) =>
            response.ok
              ? response.json()
              : Promise.reject(new Error("Не удалось загрузить заказы.")),
          )
          .then((payload) => payload.data.orders as TrackedOrder[]),
      ),
    )
      .then((groups) =>
        setOrders(
          groups
            .flat()
            .sort(
              (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
            ),
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Не удалось загрузить заказы. Попробуйте обновить страницу.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="container py-8 md:py-12">
      <h1 className="section-title mt-2">Мои заказы</h1>
      {error && (
        <p role="alert" className="mt-6">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-8 text-sm text-[#6d7972]">Загружаем заказы…</p>
      ) : orders.length ? (
        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <article key={order._id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eeea] px-5 py-4">
                <div>
                  <b className="text-sm">Заказ #{order.number}</b>
                  <p className="mt-1 text-xs text-[#7a857f]">
                    {new Intl.DateTimeFormat("ru-MD", {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <span className="rounded-lg bg-[#e9f5eb] px-3 py-1.5 text-xs font-bold text-[#2f7d4a]">
                  {orderStatusLabels[order.status]}
                </span>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-[#f4f6f4] p-2 pr-4"
                    >
                      <div className="relative size-12 overflow-hidden rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <b className="block text-xs">{item.title}</b>
                        <span className="text-[10px] text-[#748078]">
                          {item.quantity} × {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ed] pt-4 text-xs">
                  <span className="flex items-center gap-2 text-[#68756f]">
                    {order.status === "in_transit" ? (
                      <Truck size={16} />
                    ) : order.status === "packing" ? (
                      <PackageCheck size={16} />
                    ) : (
                      <Clock3 size={16} />
                    )}
                    {order.delivery.address}
                  </span>
                  <div className="text-right">
                    <b className="block text-base">
                      {formatMoney(order.totalMinor / 100)}
                    </b>
                    <span className="text-[10px] text-[#748078]">
                      {order.paymentMethod === "cash_on_delivery"
                        ? "Наличными при получении"
                        : "Картой при получении"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : !error ? (
        <div className="py-20 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#edf5ef] text-[#2f7d4a]">
            <ShoppingBasket size={32} />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">Заказов пока нет</h2>
          <p className="mt-2 text-sm text-[#6d7972]">
            Оформленные на этом устройстве заказы появятся здесь.
          </p>
          <Link href="/catalog" className="button button-primary mt-6">
            Перейти в каталог
          </Link>
        </div>
      ) : null}
    </div>
  );
}
