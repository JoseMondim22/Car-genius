import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatHours, hoursBetween } from "@/lib/hours";
import ClockButton from "@/components/ClockButton";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const entries = await prisma.timeEntry.findMany({
    where: { userId: session.userId },
    orderBy: { clockIn: "desc" },
    take: 20,
  });

  const openEntry = entries.find((e) => !e.clockOut);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Hola, {session.name}</h1>
          <p className="text-sm text-neutral-500">
            {openEntry ? "Estás trabajando ahora" : "No estás clockeado"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session.role === "ADMIN" && (
            <Link href="/admin" className="text-sm text-neutral-600 underline">
              Panel admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="mb-10 flex justify-center">
        <ClockButton isClockedIn={Boolean(openEntry)} />
      </div>

      <h2 className="mb-3 text-sm font-medium text-neutral-500">Tus últimos turnos</h2>
      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {entries.length === 0 && (
          <li className="p-4 text-sm text-neutral-400">Todavía no registraste turnos.</li>
        )}
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{formatDateTime(entry.clockIn)}</p>
              <p className="text-neutral-500">
                {entry.clockOut ? `hasta ${formatDateTime(entry.clockOut)}` : "en curso"}
              </p>
            </div>
            <span className="font-medium text-neutral-700">
              {entry.clockOut ? formatHours(hoursBetween(entry.clockIn, entry.clockOut)) : "—"}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
