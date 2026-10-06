import Link from "next/link";
import { Sprout } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Verde — на главную">
      <span className="grid size-10 place-items-center rounded-[13px] bg-[#2f7d4a] text-white">
        <Sprout size={23} strokeWidth={2.4} />
      </span>
      <span className="text-[22px] font-extrabold tracking-[-.05em]">verde</span>
    </Link>
  );
}
