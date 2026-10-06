import { z } from "zod";

export const ProductModerationSchema = z.object({
  status: z.enum(["active", "archived"]),
});
export const StoreModerationSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});
