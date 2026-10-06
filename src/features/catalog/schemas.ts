import { z } from "zod";

export const CreateProductSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(20).max(5000),
  categoryId: z.enum([
    "vegetables",
    "fruits",
    "dairy",
    "meat",
    "bakery",
    "grocery",
    "sets",
  ]),
  price: z.number().positive().max(1_000_000),
  unit: z.string().trim().min(1).max(30),
  stock: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().regex(/^\/api\/media\/[a-f0-9-]{36}\.webp$/),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const CatalogQuerySchema = z.object({
  ids: z
    .string()
    .max(10_100)
    .refine(
      (value) =>
        value.split(",").length <= 100 &&
        value.split(",").every((id) => id.length > 0 && id.length <= 100),
    )
    .optional(),
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});
