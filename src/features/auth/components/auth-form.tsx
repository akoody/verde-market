"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

type Role = "buyer" | "seller";
type Mode = "login" | "register";

export function AuthForm({
  initialRole,
  initialMode,
  nextPath,
}: {
  initialRole: Role;
  initialMode: Mode;
  nextPath?: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (mode === "register" && password !== form.get("passwordConfirm")) {
      setError("Пароли не совпадают.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password,
          ...(mode === "register" ? { name: form.get("name"), accountType: role } : {}),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const message =
          payload.error === "USERNAME_TAKEN"
            ? "Этот логин уже занят."
            : payload.error === "INVALID_CREDENTIALS"
              ? "Неверный логин или пароль."
              : payload.error === "RATE_LIMITED"
                ? "Слишком много попыток. Попробуйте позже."
                : payload.error === "VALIDATION_ERROR"
                  ? "Логин: 3–32 латинских символа. Пароль: минимум 10 символов, буква и цифра."
                  : "Сервис временно недоступен. Попробуйте позже.";
        throw new Error(message);
      }
      router.push(nextPath ?? (role === "seller" ? "/seller" : "/account/orders"));
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Не удалось выполнить вход.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#eff4eb] py-14">
      <div className="container grid max-w-4xl overflow-hidden rounded-xl bg-white shadow-[0_25px_70px_rgba(25,66,40,.12)] md:grid-cols-2">
        <div className="hidden bg-[#173027] p-8 text-white md:block md:p-10">
          <span className="text-4xl">🌿</span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-[-.045em]">
            {role === "buyer" ? "Ваши заказы всегда рядом" : "Управляйте своим магазином"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            {role === "buyer"
              ? "Сохраняйте историю покупок и отслеживайте доставку фермерских продуктов."
              : "Добавляйте товары, подтверждайте заказы и управляйте доставкой из личного кабинета."}
          </p>
          <div className="mt-8 grid gap-3 text-xs">
            {[
              "Защищённая сессия",
              "Данные хранятся в зашифрованном виде",
              "Доступ только к своему кабинету",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check size={15} className="text-[#dcef78]" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="p-7 md:p-10">
          <div className="grid grid-cols-2 rounded-xl bg-[#f0f4f1] p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`rounded-lg py-3 ${role === "buyer" ? "bg-white shadow-sm" : ""}`}
            >
              Покупатель
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`rounded-lg py-3 ${role === "seller" ? "bg-white shadow-sm" : ""}`}
            >
              Продавец
            </button>
          </div>
          <div className="mt-7 flex gap-5 border-b border-[#e5eae6] text-sm font-bold">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`pb-3 ${mode === "login" ? "border-b-2 border-[#2f7d4a] text-[#2f7d4a]" : "text-[#77827c]"}`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`pb-3 ${mode === "register" ? "border-b-2 border-[#2f7d4a] text-[#2f7d4a]" : "text-[#77827c]"}`}
            >
              Регистрация
            </button>
          </div>
          <form onSubmit={submit} className="mt-6 grid gap-4">
            {mode === "register" && (
              <label className="text-xs font-bold">
                Имя
                <input
                  className="input mt-2"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
            )}
            <label className="text-xs font-bold">
              Логин
              <input
                className="input mt-2"
                name="username"
                required
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
              />
            </label>
            <label className="text-xs font-bold">
              Пароль
              <input
                className="input mt-2"
                type="password"
                name="password"
                required
                minLength={10}
                maxLength={72}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
            {mode === "register" && (
              <label className="text-xs font-bold">
                Повторите пароль
                <input
                  className="input mt-2"
                  type="password"
                  name="passwordConfirm"
                  required
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </label>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-[#fff0ed] p-3 text-xs leading-5 text-[#a04431]"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="button button-primary w-full disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Подождите…" : mode === "login" ? "Войти" : "Создать аккаунт"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="mt-5 flex gap-2 text-[10px] leading-4 text-[#7a857f]">
            <ShieldCheck size={15} className="shrink-0 text-[#2f7d4a]" />
            Продолжая, вы принимаете условия пользовательского соглашения и обработки
            персональных данных.
          </p>
        </div>
      </div>
    </div>
  );
}
