"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "EMPLOYEE";
  active: boolean;
};

export default function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEmployees() {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data.employees ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, setState runs after the awaited fetch
    loadEmployees();
  }, []);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el trabajador");
      return;
    }

    setName("");
    setUsername("");
    setPassword("");
    loadEmployees();
  }

  async function toggleActive(employee: Employee) {
    await fetch(`/api/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !employee.active }),
    });
    loadEmployees();
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold">Trabajadores</h1>

      <form
        onSubmit={handleCreate}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          Agregar
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-2">{employee.name}</td>
                <td className="px-4 py-2">{employee.username}</td>
                <td className="px-4 py-2">{employee.role === "ADMIN" ? "Admin" : "Trabajador"}</td>
                <td className="px-4 py-2">
                  <span className={employee.active ? "text-emerald-600" : "text-neutral-400"}>
                    {employee.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => toggleActive(employee)}
                    className="text-xs text-neutral-500 underline"
                  >
                    {employee.active ? "Desactivar" : "Reactivar"}
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
