import type { Product } from "@/features/catalog/types";
import type { CartLine } from "./types";

export function summarizeCart(lines: CartLine[], products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const items = lines.flatMap((line) => {
    const product = byId.get(line.productId);
    return product ? [{ line, product }] : [];
  });
  const unavailable = lines.filter(
    (line) =>
      !byId.has(line.productId) || line.quantity > (byId.get(line.productId)?.stock ?? 0),
  );
  const farmIds = [...new Set(items.map(({ product }) => product.farmId))];
  const subtotalMinor = items.reduce(
    (sum, { product, line }) => sum + Math.round(product.price * 100) * line.quantity,
    0,
  );
  const deliveryMinor = farmIds.reduce(
    (sum, id) =>
      sum +
      Math.round(
        (items.find(({ product }) => product.farmId === id)!.product.farmDeliveryFee ??
          0) * 100,
      ),
    0,
  );
  const farmsBelowMinimum = farmIds.flatMap((id) => {
    const group = items.filter(({ product }) => product.farmId === id);
    const product = group[0].product;
    const amountMinor = group.reduce(
      (sum, item) => sum + Math.round(item.product.price * 100) * item.line.quantity,
      0,
    );
    const minOrderMinor = Math.round((product.farmMinOrder ?? 0) * 100);
    return amountMinor < minOrderMinor
      ? [
          {
            farm: {
              id,
              name: product.farmName ?? "Фермерский магазин",
              minOrder: minOrderMinor / 100,
            },
            missing: (minOrderMinor - amountMinor) / 100,
          },
        ]
      : [];
  });
  return {
    items,
    unavailable,
    farmIds,
    farmsBelowMinimum,
    subtotal: subtotalMinor / 100,
    deliveryTotal: deliveryMinor / 100,
    total: (subtotalMinor + deliveryMinor) / 100,
  };
}
