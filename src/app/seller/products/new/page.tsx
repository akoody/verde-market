import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { NewProductForm } from "@/features/catalog/components/new-product-form";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?role=seller&next=/seller/products/new");
  if (!user.roles.includes("seller")) redirect("/seller");
  return <NewProductForm />;
}
