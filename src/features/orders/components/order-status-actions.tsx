"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { orderActions } from "../status";
import type { OrderStatus } from "../types";

export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const available = orderActions[status] ?? [];
  if (!available.length) return null;

  const update = async (next: { status: OrderStatus; danger?: boolean }) => {
    if (next.danger && !window.confirm("Отменить заказ и вернуть товары в остаток?"))
      return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next.status }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Не удалось обновить статус. Обновите страницу и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {error && (
        <p role="alert" className="w-full text-xs text-[#a04431]">
          {error}
        </p>
      )}
      {available.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={loading}
          onClick={() => update(action)}
          className={`rounded-lg px-3 py-2 text-[10px] font-bold disabled:opacity-50 ${action.danger ? "bg-[#fff0ed] text-[#a04431]" : "bg-[#e8f3ea] text-[#2f7d4a]"}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
