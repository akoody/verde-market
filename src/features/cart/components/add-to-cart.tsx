"use client";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { useCart } from "@/features/cart/store";

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const quantity = useCart(
    (s) => s.lines.find((l) => l.productId === productId)?.quantity ?? 0,
  );
  if (quantity > 0)
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-12 items-center rounded-xl bg-[#edf5ef]">
          <button
            onClick={() => setQuantity(productId, quantity - 1)}
            className="grid h-full w-11 place-items-center"
            aria-label="Уменьшить"
          >
            <Minus size={17} />
          </button>
          <b className="min-w-8 text-center">{quantity}</b>
          <button
            onClick={() => setQuantity(productId, Math.min(stock, quantity + 1))}
            className="grid h-full w-11 place-items-center"
            aria-label="Увеличить"
            disabled={quantity >= stock}
          >
            <Plus size={17} />
          </button>
        </div>
        <span className="text-sm font-bold text-[#2f7d4a]">В корзине</span>
      </div>
    );
  return (
    <button
      onClick={() => add(productId)}
      disabled={stock <= 0}
      className="button button-primary w-full sm:w-auto"
    >
      <ShoppingBasket size={19} />
      {stock <= 0 ? "Нет в наличии" : "Добавить в корзину"}
    </button>
  );
}
