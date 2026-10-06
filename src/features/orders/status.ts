import type { OrderStatus } from "./types";

type StatusAction = { status: OrderStatus; label: string; danger?: boolean };
export const orderActions: Record<OrderStatus, readonly StatusAction[]> = {
  pending: [
    { status: "accepted", label: "Подтвердить" },
    { status: "canceled", label: "Отменить", danger: true },
  ],
  accepted: [
    { status: "packing", label: "Начать сборку" },
    { status: "canceled", label: "Отменить", danger: true },
  ],
  packing: [
    { status: "in_transit", label: "Передать в доставку" },
    { status: "canceled", label: "Отменить", danger: true },
  ],
  in_transit: [{ status: "delivered", label: "Заказ доставлен" }],
  delivered: [],
  canceled: [],
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Ожидает подтверждения",
  accepted: "Принят фермером",
  packing: "Собирается",
  in_transit: "В пути",
  delivered: "Доставлен",
  canceled: "Отменён",
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return orderActions[from].some((action) => action.status === to);
}
