"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";

export function useProducts(ids?: readonly string[]) {
  const idsKey = ids ? [...new Set(ids)].sort().join(",") : undefined;
  const [state, setState] = useState<{
    key: string | undefined;
    products: Product[];
    loading: boolean;
    error: string;
  }>({ key: idsKey, products: [], loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const products: Product[] = [];
        if (idsKey !== "") {
          let offset = 0;
          let total = 1;
          while (offset < total) {
            const query = new URLSearchParams({ limit: "100", offset: String(offset) });
            if (idsKey !== undefined) query.set("ids", idsKey);
            const response = await fetch(`/api/products?${query}`, {
              signal: controller.signal,
            });
            if (!response.ok)
              throw new Error(
                "Не удалось загрузить товары. Попробуйте обновить страницу.",
              );
            const payload = (await response.json()) as {
              data: Product[];
              meta: { total: number };
            };
            products.push(...payload.data);
            total = payload.meta.total;
            offset += 100;
            if (offset > 10_000) break;
          }
        }
        if (!controller.signal.aborted)
          setState({ key: idsKey, products, loading: false, error: "" });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            key: idsKey,
            products: [],
            loading: false,
            error:
              error instanceof Error ? error.message : "Не удалось загрузить товары.",
          });
      }
    }
    void load();
    return () => controller.abort();
  }, [idsKey]);
  return state.key === idsKey ? state : { products: [], loading: true, error: "" };
}
