import { z } from "zod";

export const CreateStoreSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(30).max(3000),
  addressLabel: z.string().trim().min(3).max(300),
  deliveryRadiusKm: z.number().int().min(1).max(300),
  minOrder: z.number().min(0).max(100_000),
  deliveryFee: z.number().min(0).max(10_000),
  acceptsCard: z.boolean(),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
