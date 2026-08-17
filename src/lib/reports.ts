import { hoursBetween } from "@/lib/hours";

export type ReportEntry = {
  userId: string;
  userName: string;
  clockIn: Date;
  clockOut: Date | null;
};

export type ScheduleRow = {
  userId: string;
  dayOfWeek: number;
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

function dateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function scheduledHoursFor(schedules: ScheduleRow[], userId: string, dayOfWeek: number) {
  return schedules
    .filter((s) => s.userId === userId && s.dayOfWeek === dayOfWeek)
    .reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      return sum + (eh + em / 60 - (sh + sm / 60));
    }, 0);
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
      byKey.set(key, {
        userId: entry.userId,
        userName: entry.userName,
        date: dateKey(entry.clockIn),
        workedHours: worked,
        scheduledHours: scheduledHoursFor(schedules, entry.userId, entry.clockIn.getDay()),
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
