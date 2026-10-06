"use client";
import { Heart } from "lucide-react";
import { useFavorites } from "../favorites-store";

export function FavoriteButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const selected = useFavorites((state) => state.ids.includes(productId));
  const toggle = useFavorites((state) => state.toggle);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={selected ? "Удалить из избранного" : "Добавить в избранное"}
      onClick={() => toggle(productId)}
      className={className}
    >
      <Heart size={18} fill={selected ? "currentColor" : "none"} />
    </button>
  );
}
