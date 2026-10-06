import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { AuthForm } from "@/features/auth/components/auth-form";

const safeNext = (value?: string) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : undefined;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const user = await getCurrentUser();
  if (user)
    redirect(next ?? (user.roles.includes("seller") ? "/seller" : "/account/orders"));
  return (
    <AuthForm
      initialRole={params.role === "seller" ? "seller" : "buyer"}
      initialMode={params.mode === "register" ? "register" : "login"}
      nextPath={next}
    />
  );
}
