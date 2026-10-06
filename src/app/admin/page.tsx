import { getModerationQueue } from "@/features/moderation/server/queries";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { formatMoney } from "@/shared/lib/format";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { ModerationActions } from "@/features/moderation/components/moderation-actions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.roles.includes("admin")) redirect("/");
  const { stores, products, storesById } = await getModerationQueue();

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title mt-2">Модерация</h1>
        </div>
        <div className="w-36">
          <LogoutButton />
        </div>
      </div>
      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Новые магазины · {stores.length}</h2>
        <div className="mt-4 grid gap-3">
          {stores.length ? (
            stores.map((store) => (
              <article
                key={String(store._id)}
                className="card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <b>{store.name}</b>
                  <p className="mt-1 text-xs text-[#68756f]">
                    {store.addressLabel} · доставка {store.deliveryRadiusKm} км
                  </p>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-[#758079]">
                    {store.description}
                  </p>
                </div>
                <ModerationActions
                  endpoint={`/api/admin/stores/${String(store._id)}/status`}
                  approveStatus="verified"
                />
              </article>
            ))
          ) : (
            <p className="mt-4 text-sm text-[#68756f]">Нет магазинов на проверке.</p>
          )}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-extrabold">Новые товары · {products.length}</h2>
        <div className="mt-4 grid gap-3">
          {products.length ? (
            products.map((product) => {
              const store = storesById.get(String(product.storeId));
              return (
                <article
                  key={String(product._id)}
                  className="card flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="relative size-20 overflow-hidden rounded-xl bg-[#edf2ed]">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <b>{product.title}</b>
                    <p className="mt-1 text-xs text-[#68756f]">
                      {store?.name ?? "Магазин"} · {formatMoney(product.priceMinor / 100)}{" "}
                      / {product.unit}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#758079]">
                      {product.description}
                    </p>
                  </div>
                  <ModerationActions
                    endpoint={`/api/admin/products/${String(product._id)}/status`}
                    approveStatus="active"
                  />
                </article>
              );
            })
          ) : (
            <p className="mt-4 text-sm text-[#68756f]">Нет товаров на проверке.</p>
          )}
        </div>
      </section>
    </div>
  );
}
