import { createHash } from "node:crypto";
import type { CheckoutInput } from "./schemas";

export const hashOrderToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export function checkoutFingerprint(input: CheckoutInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        items: [...input.items].sort((left, right) =>
          left.productId.localeCompare(right.productId),
        ),
        customer: input.customer,
        delivery: input.delivery,
        paymentMethod: input.paymentMethod,
      }),
    )
    .digest("hex");
}
