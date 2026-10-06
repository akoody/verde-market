import { getSellerDashboard } from "@/features/stores/server/dashboard.queries";
import { orderStatusLabels } from "@/features/orders/status";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CircleDollarSign,
  Clock3,
  LayoutGrid,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { getCurrentUser } from "@/features/auth/server/session";
import { formatMoney } from "@/shared/lib/format";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { OrderStatusActions } from "@/features/orders/components/order-status-actions";
import { StoreOnboardingForm } from "@/features/stores/components/store-onboarding-form";

export default async function SellerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?role=seller&next=/seller");
  if (!user.roles.includes("seller")) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-extrabold">Нужен аккаунт продавца</h1>
        <p className="mt-3 text-sm text-[#68756f]">
          Этот аккаунт зарегистрирован как покупатель.
        </p>
        <LogoutButton />
      </div>
    );
  }

  const dashboard = await getSellerDashboard(user.id);
  if (!dashboard) return <StoreOnboardingForm name={user.name ?? user.username} />;
  const { store, recentOrders, newOrders, activeProducts, lowProducts, revenueMinor } =
    dashboard;
  const initials = store.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-108px)] bg-[#f3f5f2]">
      <div className="container grid py-6 lg:grid-cols-[230px_1fr] lg:gap-7">
        <aside className="card hidden h-fit p-3 lg:block">
          <div className="flex items-center gap-3 border-b border-[#edf0ed] p-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#dcef78] text-xs font-extrabold">
              {initials}
            </span>
            <div className="min-w-0">
              <b className="block truncate text-sm">{store.name}</b>
              <span
                className={`text-[10px] font-bold ${store.verificationStatus === "verified" ? "text-[#2f7d4a]" : "text-[#9a721a]"}`}
              >
                {store.verificationStatus === "verified"
                  ? "Магазин активен"
                  : "На проверке"}
              </span>
            </div>
          </div>
          <nav className="mt-2 grid gap-1 text-sm font-semibold">
            <Link
              href="/seller"
              className="flex items-center gap-3 rounded-xl bg-[#eaf3ec] px-3 py-3 text-[#2f7d4a]"
            >
              <LayoutGrid size={18} />
              Обзор
            </Link>
            <Link
              href="/seller#orders"
              className="flex items-center gap-3 rounded-xl px-3 py-3"
            >
              <ShoppingBag size={18} />
              Заказы
            </Link>
            <Link
              href="/seller/products/new"
              className="flex items-center gap-3 rounded-xl px-3 py-3"
            >
              <Package size={18} />
              Добавить товар
            </Link>
          </nav>
          <div className="mt-3 border-t border-[#edf0ed] pt-3">
            <LogoutButton />
          </div>
        </aside>

        <main>
          {store.verificationStatus !== "verified" && (
            <div className="mb-5 rounded-2xl border border-[#ead9a8] bg-[#fff8e6] p-4 text-sm leading-6 text-[#6f5516]">
              Магазин отправлен на проверку. До подтверждения товары не показываются
              покупателям.
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-1 text-3xl font-extrabold tracking-[-.045em]">
                Здравствуйте, {user.name ?? user.username}
              </h1>
            </div>
            <Link href="/seller/products/new" className="button button-primary !min-h-11">
              <Plus size={18} />
              Добавить товар
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-3">
            <Metric
              icon={CircleDollarSign}
              label="Выручка сегодня"
              value={formatMoney(revenueMinor / 100)}
            />
            <Metric icon={ShoppingBag} label="Новые заказы" value={String(newOrders)} />
            <Metric icon={Package} label="Товары" value={String(activeProducts)} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
            <section id="orders" className="card overflow-hidden">
              <div className="border-b border-[#edf0ed] p-5">
                <h2 className="font-extrabold">Последние заказы</h2>
                <p className="mt-1 text-[11px] text-[#7a857f]">
                  Только заказы вашего магазина
                </p>
              </div>
              {recentOrders.length ? (
                <div className="divide-y divide-[#edf0ed]">
                  {recentOrders.map((order) => (
                    <div key={String(order._id)} className="p-5">
                      <div className="grid grid-cols-[1fr_auto] items-start gap-3 sm:grid-cols-[1fr_1.4fr_auto_auto]">
                        <div>
                          <b className="text-sm">#{order.number}</b>
                          <p className="text-[11px] text-[#7a857f]">
                            {new Intl.DateTimeFormat("ru-MD", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(order.createdAt)}
                          </p>
                        </div>
                        <div className="hidden text-xs sm:block">
                          <b>{order.customer?.name}</b>
                          <p className="mt-1 text-[11px] text-[#69766f]">
                            {order.customer?.phone} · {order.delivery?.address}
                          </p>
                        </div>
                        <b className="text-sm">{formatMoney(order.totalMinor / 100)}</b>
                        <span className="rounded-lg bg-[#e8f3ea] px-2.5 py-1.5 text-[10px] font-bold text-[#2f7d4a]">
                          {orderStatusLabels[order.status] ?? order.status}
                        </span>
                      </div>
                      <OrderStatusActions
                        orderId={String(order._id)}
                        status={order.status}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Empty label="Новых заказов пока нет" />
              )}
            </section>

            <section className="card p-5">
              <h2 className="font-extrabold">Заканчиваются</h2>
              <p className="mt-1 text-[11px] text-[#7a857f]">
                Товары с остатком до 5 единиц
              </p>
              {lowProducts.length ? (
                <div className="mt-5 grid gap-4">
                  {lowProducts.map((product) => (
                    <div key={String(product._id)} className="flex items-center gap-3">
                      <div className="relative size-11 overflow-hidden rounded-xl bg-[#edf1ed]">
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <b className="block truncate text-xs">{product.title}</b>
                        <span className="text-[10px] text-[#c65d42]">
                          Осталось {product.stock} {product.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-xs text-[#6d7972]">Все остатки в порядке.</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <article className="card p-5">
      <span className="grid size-9 place-items-center rounded-xl bg-[#edf5ef] text-[#2f7d4a]">
        <Icon size={18} />
      </span>
      <b className="mt-4 block text-2xl tracking-[-.04em]">{value}</b>
      <span className="mt-1 block text-[11px] text-[#78837d]">{label}</span>
    </article>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="p-10 text-center">
      <Clock3 className="mx-auto text-[#9ca7a1]" />
      <p className="mt-3 text-sm text-[#6d7972]">{label}</p>
    </div>
  );
}
