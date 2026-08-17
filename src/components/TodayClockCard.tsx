"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatHours } from "@/lib/hours";

export default function TodayClockCard({
  isClockedIn,
  hoursToday,
}: {
  isClockedIn: boolean;
  hoursToday: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/clock", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">Reloj de hoy</h2>
        <div className="rounded-lg bg-neutral-50 px-3 py-1.5 text-sm text-neutral-600">
          Horas trabajadas hoy <span className="font-semibold text-neutral-900">{formatHours(hoursToday)}</span>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <button
          onClick={handleClick}
          disabled={loading}
          className={`flex h-40 w-40 flex-col items-center justify-center rounded-full text-lg font-semibold text-white shadow-md transition disabled:opacity-50 ${
            isClockedIn ? "bg-red-500 hover:bg-red-400" : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {loading ? "..." : isClockedIn ? "Marcar salida" : "Marcar entrada"}
        </button>
      </div>
    </div>
  );
}
