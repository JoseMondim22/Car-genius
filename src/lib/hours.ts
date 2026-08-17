export function hoursBetween(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function formatHours(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(date);
}

export function parseLocalDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
