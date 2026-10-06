import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9][a-z0-9._-]*$/, "INVALID_USERNAME");

export const passwordSchema = z
  .string()
  .min(10)
  .max(72)
  .refine((value) => new TextEncoder().encode(value).length <= 72, "PASSWORD_TOO_LONG")
  .regex(/[a-zA-Z]/, "PASSWORD_REQUIRES_LETTER")
  .regex(/[0-9]/, "PASSWORD_REQUIRES_NUMBER");

export const LoginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  name: z.string().trim().min(2).max(100),
  accountType: z.enum(["buyer", "seller"]),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
