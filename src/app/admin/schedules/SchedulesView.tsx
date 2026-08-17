"use client";

import { useEffect, useState } from "react";

type Employee = { id: string; name: string; role: "ADMIN" | "EMPLOYEE" };
type Schedule = { id: string; userId: string; dayOfWeek: number; startTime: string; endTime: string };

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function SchedulesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [userId, setUserId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState("");

  async function loadData() {
    const [empRes, schedRes] = await Promise.all([
      fetch("/api/employees"),
      fetch("/api/schedules"),
    ]);
    const empData = await empRes.json();
    const schedData = await schedRes.json();
    const activeEmployees = (empData.employees ?? []).filter((e: Employee & { active?: boolean }) => e.active !== false);
    setEmployees(activeEmployees);
    setSchedules(schedData.schedules ?? []);
    if (!userId && activeEmployees.length > 0) setUserId(activeEmployees[0].id);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, setState runs after the awaited fetch
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, dayOfWeek, startTime, endTime }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar el horario");
      return;
    }

    loadData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold">Horarios programados</h1>

      <form
        onSubmit={handleCreate}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Trabajador</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Día</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          >
            {DAYS.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Entrada</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Salida</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Agregar horario
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2">Trabajador</th>
              <th className="px-4 py-2">Día</th>
              <th className="px-4 py-2">Entrada</th>
              <th className="px-4 py-2">Salida</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {schedules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No hay horarios asignados todavía.
                </td>
              </tr>
            )}
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2">{employees.find((e) => e.id === s.userId)?.name ?? "—"}</td>
                <td className="px-4 py-2">{DAYS[s.dayOfWeek]}</td>
                <td className="px-4 py-2">{s.startTime}</td>
                <td className="px-4 py-2">{s.endTime}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-xs text-neutral-500 underline">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
