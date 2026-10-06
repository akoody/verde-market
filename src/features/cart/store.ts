"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/features/cart/types";

type CartState = {
  lines: CartLine[];
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, quantity = 1) =>
        set((state) => {
          const current = state.lines.find((line) => line.productId === productId);
          return {
            lines: current
              ? state.lines.map((line) =>
                  line.productId === productId
                    ? { ...line, quantity: line.quantity + quantity }
                    : line,
                )
              : [...state.lines, { productId, quantity }],
          };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.productId !== productId)
              : state.lines.map((line) =>
                  line.productId === productId ? { ...line, quantity } : line,
                ),
        })),
      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.productId !== productId),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "verde-market-cart" },
  ),
);
