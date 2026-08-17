import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildDailyReport } from "@/lib/reports";
import { formatDate, formatHours, parseLocalDate } from "@/lib/hours";
import AppShell from "@/components/AppShell";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const params = await searchParams;

  const from = params.from ? startOfDay(new Date(params.from)) : daysAgo(6);
  const to = params.to ? startOfDay(new Date(params.to)) : startOfDay(new Date());
  const toExclusive = new Date(to);
  toExclusive.setDate(toExclusive.getDate() + 1);

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const entries = await prisma.timeEntry.findMany({
    where: {
      clockIn: { gte: from, lt: toExclusive },
      ...(params.userId ? { userId: params.userId } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { clockIn: "desc" },
  });

  const schedules = await prisma.schedule.findMany({
    where: params.userId ? { userId: params.userId } : undefined,
  });

  const rows = buildDailyReport(
    entries.map((e) => ({
      userId: e.userId,
      userName: e.user.name,
      clockIn: e.clockIn,
      clockOut: e.clockOut,
    })),
    schedules
  );

  const totalWorked = rows.reduce((sum, r) => sum + r.workedHours, 0);
  const totalScheduled = rows.reduce((sum, r) => sum + r.scheduledHours, 0);

  return (
    <AppShell session={session}>
      <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-6 text-xl font-semibold">Reportes</h1>

      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Trabajador</label>
          <select
            name="userId"
            defaultValue={params.userId ?? ""}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Desde</label>
          <input
            type="date"
            name="from"
            defaultValue={from.toISOString().slice(0, 10)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Hasta</label>
          <input
            type="date"
            name="to"
            defaultValue={to.toISOString().slice(0, 10)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Filtrar
        </button>
      </form>

      <div className="mb-4 flex gap-6 text-sm">
        <p>
          Total trabajado: <span className="font-semibold">{formatHours(totalWorked)}</span>
        </p>
        <p>
          Total programado: <span className="font-semibold">{formatHours(totalScheduled)}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2">Trabajador</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Horas trabajadas</th>
              <th className="px-4 py-2">Horas programadas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  No hay registros en este rango.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={`${row.userId}-${row.date}`}>
                <td className="px-4 py-2">{row.userName}</td>
                <td className="px-4 py-2">{formatDate(parseLocalDate(row.date))}</td>
                <td className="px-4 py-2">{formatHours(row.workedHours)}</td>
                <td className="px-4 py-2 text-neutral-500">{formatHours(row.scheduledHours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </AppShell>
  );
}
