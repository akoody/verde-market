"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = { ids: string[]; toggle: (id: string) => void };
export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((value) => value !== id)
            : [...state.ids, id].slice(-100),
        })),
    }),
    { name: "verde-market-favorites" },
  ),
);
