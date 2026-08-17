"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClockButton({ isClockedIn }: { isClockedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/clock", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full max-w-xs rounded-2xl py-6 text-xl font-semibold text-white shadow-sm transition disabled:opacity-50 ${
        isClockedIn
          ? "bg-red-600 hover:bg-red-500"
          : "bg-emerald-600 hover:bg-emerald-500"
      }`}
    >
      {loading ? "..." : isClockedIn ? "Marcar salida" : "Marcar entrada"}
    </button>
  );
}
