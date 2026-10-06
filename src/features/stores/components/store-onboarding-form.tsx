"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Store } from "lucide-react";

export function StoreOnboardingForm({ name }: { name: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/seller/store", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
          addressLabel: form.get("addressLabel"),
          deliveryRadiusKm: Number(form.get("deliveryRadiusKm")),
          minOrder: Number(form.get("minOrder")),
          deliveryFee: Number(form.get("deliveryFee")),
          acceptsCard: form.get("acceptsCard") === "on",
        }),
      });
      if (!response.ok)
        throw new Error("Проверьте заполнение анкеты и попробуйте ещё раз.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось создать магазин.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <div className="card p-6 md:p-9">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#edf5ef] text-[#2f7d4a]">
          <Store />
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-.045em]">
          Создайте свой магазин
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#68756f]">
          Здравствуйте, {name}. Заполните данные хозяйства. После проверки магазин станет
          доступен покупателям.
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold sm:col-span-2">
            Название хозяйства
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              className="input mt-2"
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            О хозяйстве
            <textarea
              name="description"
              required
              minLength={30}
              maxLength={3000}
              className="input mt-2 min-h-32 py-3"
              placeholder="Что выращиваете, как работаете, чем отличаетесь..."
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            Район и населённый пункт
            <input
              name="addressLabel"
              required
              className="input mt-2"
              placeholder="Оргеевский район, с. Требужены"
            />
          </label>
          <label className="text-xs font-bold">
            Радиус доставки, км
            <input
              name="deliveryRadiusKm"
              required
              type="number"
              min={1}
              max={300}
              defaultValue={30}
              className="input mt-2"
            />
          </label>
          <label className="text-xs font-bold">
            Минимальный заказ, L
            <input
              name="minOrder"
              required
              type="number"
              min={0}
              step="0.01"
              defaultValue={300}
              className="input mt-2"
            />
          </label>
          <label className="text-xs font-bold">
            Стоимость доставки, L
            <input
              name="deliveryFee"
              required
              type="number"
              min={0}
              step="0.01"
              defaultValue={50}
              className="input mt-2"
            />
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl bg-[#f2f5f2] p-4 text-xs font-bold">
            <input
              name="acceptsCard"
              type="checkbox"
              className="size-4 accent-[#2f7d4a]"
            />
            Принимаю оплату картой при получении
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-[#fff0ed] p-3 text-xs text-[#a04431] sm:col-span-2"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="button button-primary sm:col-span-2"
          >
            {submitting ? "Создаём…" : "Отправить на проверку"}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
