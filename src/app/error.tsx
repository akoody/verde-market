"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container py-16">
      <h1 className="section-title">Не удалось загрузить страницу</h1>
      <p className="mt-4">Сервис временно недоступен. Попробуйте ещё раз.</p>
      <button type="button" onClick={reset} className="button button-primary mt-6">
        Повторить
      </button>
    </div>
  );
}
