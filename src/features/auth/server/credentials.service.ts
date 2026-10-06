import { compare, hash } from "bcryptjs";
import { connectDatabase } from "@/shared/server/database";
import { AppError, isDuplicateKey } from "@/shared/lib/errors";
import { UserModel } from "./user.model";
import type { LoginInput, RegisterInput } from "../schemas";
import type { SessionUser, UserRole } from "../types";

type CredentialsResult = { user: SessionUser; authVersion: number };

export async function login(input: LoginInput): Promise<CredentialsResult> {
  await connectDatabase();
  const user = await UserModel.findOne({ username: input.username }).select(
    "+passwordHash username name roles status authVersion",
  );
  if (!user) {
    await hash(input.password, 12);
    throw new AppError("INVALID_CREDENTIALS", 401);
  }
  const valid = await compare(input.password, user.passwordHash);
  if (!valid || user.status !== "active") throw new AppError("INVALID_CREDENTIALS", 401);
  return {
    user: {
      id: String(user._id),
      username: user.username,
      name: user.name ?? undefined,
      roles: [...user.roles] as UserRole[],
    },
    authVersion: user.authVersion,
  };
}

export async function register(input: RegisterInput): Promise<CredentialsResult> {
  await connectDatabase();
  const passwordHash = await hash(input.password, 12);
  const roles: UserRole[] =
    input.accountType === "seller" ? ["buyer", "seller"] : ["buyer"];
  try {
    const created = await UserModel.create({
      username: input.username,
      passwordHash,
      name: input.name,
      roles,
      status: "active",
    });
    return {
      user: {
        id: String(created._id),
        username: created.username,
        name: created.name ?? undefined,
        roles,
      },
      authVersion: created.authVersion,
    };
  } catch (error) {
    if (isDuplicateKey(error)) throw new AppError("USERNAME_TAKEN", 409);
    throw error;
  }
}
