"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#8b4b3c]"
    >
      <LogOut size={18} /> Выйти
    </button>
  );
}
