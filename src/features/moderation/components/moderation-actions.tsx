"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModerationActions({
  endpoint,
  approveStatus,
}: {
  endpoint: string;
  approveStatus: "verified" | "active";
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = async (status: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Не удалось сохранить решение. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {error && (
        <p role="alert" className="w-full text-xs text-[#a04431]">
          {error}
        </p>
      )}
      <button
        disabled={loading}
        onClick={() => update(approveStatus)}
        className="rounded-lg bg-[#e8f3ea] px-3 py-2 text-xs font-bold text-[#2f7d4a]"
      >
        Одобрить
      </button>
      <button
        disabled={loading}
        onClick={() => update(approveStatus === "verified" ? "rejected" : "archived")}
        className="rounded-lg bg-[#fff0ed] px-3 py-2 text-xs font-bold text-[#a04431]"
      >
        Отклонить
      </button>
    </div>
  );
}
