const STORAGE_KEY = "verde-order-tokens";

export function readOrderTokens(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value
          .filter(
            (token): token is string =>
              typeof token === "string" && /^[a-f0-9]{64}$/.test(token),
          )
          .slice(0, 20)
      : [];
  } catch {
    return [];
  }
}

export function saveOrderToken(token: string) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        [token, ...readOrderTokens().filter((value) => value !== token)].slice(0, 20),
      ),
    );
  } catch {
    throw new Error(
      "Разрешите сохранение данных в браузере, чтобы оформить заказ и отслеживать его.",
    );
  }
}
