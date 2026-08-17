import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateKey, formatDate, formatHours, formatTime, hoursBetween, parseLocalDate } from "@/lib/hours";
import { resolveScheduleFor } from "@/lib/reports";
import AppShell from "@/components/AppShell";
import TodayClockCard from "@/components/TodayClockCard";

const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const UPCOMING_DAYS = 7;

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const params = await searchParams;
  const anchor = params.week ? parseLocalDate(params.week) : new Date();
  const weekStart = startOfWeek(anchor);
  const weekEnd = addDays(weekStart, 7);
  const prevWeek = dateKey(addDays(weekStart, -7));
  const nextWeek = dateKey(addDays(weekStart, 7));

  const weekEntries = await prisma.timeEntry.findMany({
    where: { userId: session.userId, clockIn: { gte: weekStart, lt: weekEnd } },
    orderBy: { clockIn: "asc" },
  });

  const today = dateKey(new Date());
  const todayEntries = weekEntries.filter((e) => dateKey(e.clockIn) === today);
  const hoursToday = todayEntries.reduce(
    (sum, e) => sum + (e.clockOut ? hoursBetween(e.clockIn, e.clockOut) : 0),
    0
  );
  const openEntry = weekEntries.find((e) => !e.clockOut);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weeklyTotal = weekEntries.reduce(
    (sum, e) => sum + (e.clockOut ? hoursBetween(e.clockIn, e.clockOut) : 0),
    0
  );

  const mySchedules = await prisma.schedule.findMany({ where: { userId: session.userId } });
  const scheduleRows = mySchedules.map((s) => ({
    userId: s.userId,
    dayOfWeek: s.dayOfWeek,
    date: s.date ? s.date.toISOString().slice(0, 10) : null,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const todayDate = new Date();
  const upcomingDays = Array.from({ length: UPCOMING_DAYS }, (_, i) => addDays(todayDate, i));
  const upcomingSchedule = upcomingDays.map((day) => {
    const key = dateKey(day);
    return {
      date: day,
      key,
      schedule: resolveScheduleFor(scheduleRows, session.userId, day.getDay(), key),
    };
  });

  return (
    <AppShell session={session}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <TodayClockCard isClockedIn={Boolean(openEntry)} hoursToday={hoursToday} />

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Mi horario</h2>
          <ul className="divide-y divide-neutral-100 text-sm">
            {upcomingSchedule.map(({ date, key, schedule }, i) => (
              <li key={key} className="flex items-center justify-between py-2">
                <span className={i === 0 ? "font-medium text-neutral-900" : "text-neutral-600"}>
                  {i === 0 ? "Hoy" : DAY_LABELS[(date.getDay() + 6) % 7]} · {formatDate(date)}
                </span>
                {schedule ? (
                  <span className="font-medium text-neutral-900">
                    {schedule.startTime} – {schedule.endTime}
                    {schedule.date && <span className="ml-1 text-xs text-neutral-400">(especial)</span>}
                  </span>
                ) : (
                  <span className="text-neutral-400">Sin horario asignado</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Timesheet</h2>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/dashboard?week=${prevWeek}`} className="text-neutral-500 hover:text-neutral-900">
                ← Semana anterior
              </Link>
              <span className="text-neutral-400">
                {dateKey(weekStart)} — {dateKey(addDays(weekStart, 6))}
              </span>
              <Link href={`/dashboard?week=${nextWeek}`} className="text-neutral-500 hover:text-neutral-900">
                Semana siguiente →
              </Link>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="text-neutral-400">
              <tr>
                <th className="py-2 font-medium">Día</th>
                <th className="py-2 font-medium">Entrada</th>
                <th className="py-2 font-medium">Salida</th>
                <th className="py-2 font-medium">Horas totales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {days.map((day, i) => {
                const key = dateKey(day);
                const entries = weekEntries.filter((e) => dateKey(e.clockIn) === key);
                const total = entries.reduce(
                  (sum, e) => sum + (e.clockOut ? hoursBetween(e.clockIn, e.clockOut) : 0),
                  0
                );
                const start = entries[0];
                const lastWithClockOut = [...entries].reverse().find((e) => e.clockOut);

                return (
                  <tr key={key}>
                    <td className="py-2">{DAY_LABELS[i]}</td>
                    <td className="py-2 text-neutral-500">{start ? formatTime(start.clockIn) : "--"}</td>
                    <td className="py-2 text-neutral-500">
                      {entries.some((e) => !e.clockOut)
                        ? "en curso"
                        : lastWithClockOut
                          ? formatTime(lastWithClockOut.clockOut!)
                          : "--"}
                    </td>
                    <td className="py-2 font-medium">{entries.length ? formatHours(total) : "--"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200">
                <td className="py-2 font-semibold" colSpan={3}>
                  Total semanal
                </td>
                <td className="py-2 font-semibold">{formatHours(weeklyTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
