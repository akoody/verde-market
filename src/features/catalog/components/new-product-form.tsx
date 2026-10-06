"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { categories } from "@/features/catalog/categories";

export function NewProductForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const file = form.get("image");
      if (!(file instanceof File) || !file.size) {
        throw new Error("Добавьте фотографию товара.");
      }
      const mediaForm = new FormData();
      mediaForm.set("file", file);
      const mediaResponse = await fetch("/api/seller/media", {
        method: "POST",
        body: mediaForm,
      });
      const mediaPayload = await mediaResponse.json();
      if (!mediaResponse.ok) {
        throw new Error("Фотография должна быть JPEG, PNG или WebP размером до 5 МБ.");
      }
      const response = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          categoryId: form.get("categoryId"),
          price: Number(form.get("price")),
          unit: form.get("unit"),
          stock: Number(form.get("stock")),
          imageUrl: mediaPayload.data.url,
        }),
      });
      if (!response.ok) throw new Error("Проверьте данные товара и попробуйте ещё раз.");
      router.push("/seller");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Не удалось создать товар.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <Link
        href="/seller"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#2f7d4a]"
      >
        <ArrowLeft size={17} />
        Назад в кабинет
      </Link>
      <div className="card mt-5 p-6 md:p-9">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#edf5ef] text-[#2f7d4a]">
          <PackagePlus />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-[-.045em]">Новый товар</h1>
        <p className="mt-2 text-sm text-[#68756f]">
          Товар сохранится как черновик. Фотографии и публикация станут доступны после
          проверки магазина.
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold sm:col-span-2">
            Название
            <input
              name="title"
              required
              minLength={3}
              maxLength={180}
              className="input mt-2"
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            Описание
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={5000}
              className="input mt-2 min-h-32 py-3"
            />
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            Фотография
            <input
              name="image"
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full rounded-xl border border-[#dfe6e1] bg-white p-3 text-xs"
            />
            <span className="mt-2 block font-normal text-[#758079]">
              JPEG, PNG или WebP, не более 5 МБ.
            </span>
          </label>
          <label className="text-xs font-bold">
            Категория
            <select name="categoryId" required className="input mt-2">
              {categories
                .filter((category) => category.id !== "all")
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-xs font-bold">
            Цена, L
            <input
              name="price"
              required
              type="number"
              min="0.01"
              step="0.01"
              className="input mt-2"
            />
          </label>
          <label className="text-xs font-bold">
            Единица продажи
            <input
              name="unit"
              required
              maxLength={30}
              className="input mt-2"
              placeholder="кг, 500 г, шт"
            />
          </label>
          <label className="text-xs font-bold">
            Остаток
            <input
              name="stock"
              required
              type="number"
              min={0}
              step={1}
              className="input mt-2"
            />
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
            {submitting ? "Сохраняем…" : "Сохранить черновик"}
          </button>
        </form>
      </div>
    </div>
  );
}
