import { z } from "zod";

const moldovanPhone = /^\+373[0-9]{8}$/;

export const CheckoutSchema = z
  .object({
    checkoutId: z.string().uuid(),
    accessToken: z.string().regex(/^[a-f0-9]{64}$/),
    items: z
      .array(
        z.object({
          productId: z.string().min(1).max(100),
          quantity: z.number().int().min(1).max(100),
        }),
      )
      .min(1)
      .max(100),
    customer: z.object({
      name: z.string().trim().min(2).max(100),
      phone: z
        .string()
        .transform((value) => value.replace(/[\s()-]/g, ""))
        .pipe(z.string().regex(moldovanPhone)),
    }),
    delivery: z.object({
      address: z.string().trim().min(8).max(500),
      instructions: z.string().trim().max(500).optional(),
    }),
    paymentMethod: z.enum(["cash_on_delivery", "card_on_delivery"]),
  })
  .superRefine((value, context) => {
    const ids = value.items.map((item) => item.productId);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Duplicate products are not allowed",
      });
    }
  });

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export const OrderStatusSchema = z.object({
  status: z.enum(["accepted", "packing", "in_transit", "delivered", "canceled"]),
});
