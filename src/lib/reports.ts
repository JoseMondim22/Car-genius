import { dateKey, hoursBetween } from "@/lib/hours";

export type ReportEntry = {
  userId: string;
  userName: string;
  clockIn: Date;
  clockOut: Date | null;
};

export type ScheduleRow = {
  userId: string;
  dayOfWeek: number;
  date: string | null;
  startTime: string;
  endTime: string;
};

export type DayRow = {
  userId: string;
  userName: string;
  date: string;
  workedHours: number;
  scheduledHours: number;
};

function hoursOf(schedule: ScheduleRow) {
  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

function scheduledHoursFor(schedules: ScheduleRow[], userId: string, dayOfWeek: number, day: string) {
  const override = schedules.find((s) => s.userId === userId && s.date === day);
  if (override) return hoursOf(override);

  const base = schedules.find((s) => s.userId === userId && s.date === null && s.dayOfWeek === dayOfWeek);
  return base ? hoursOf(base) : 0;
}

export function buildDailyReport(entries: ReportEntry[], schedules: ScheduleRow[]): DayRow[] {
  const byKey = new Map<string, DayRow>();

  for (const entry of entries) {
    const key = `${entry.userId}__${dateKey(entry.clockIn)}`;
    const worked = entry.clockOut ? hoursBetween(entry.clockIn, entry.clockOut) : 0;

    const existing = byKey.get(key);
    if (existing) {
      existing.workedHours += worked;
    } else {
      const day = dateKey(entry.clockIn);
      byKey.set(key, {
        userId: entry.userId,
        userName: entry.userName,
        date: day,
        workedHours: worked,
        scheduledHours: scheduledHoursFor(schedules, entry.userId, entry.clockIn.getDay(), day),
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
