export type UserRole = "buyer" | "seller" | "admin";
export type SessionUser = {
  id: string;
  username: string;
  name?: string;
  roles: UserRole[];
};
