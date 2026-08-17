"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo iniciar sesión");
      return;
    }

    const data = await res.json();
    router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-2xl font-semibold">Auto Care Genius</h1>
        <p className="mb-6 text-sm text-neutral-500">Control de horarios del equipo</p>

        <label className="mb-1 block text-sm font-medium text-neutral-700">Usuario</label>
        <input
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />

        <label className="mb-1 block text-sm font-medium text-neutral-700">Contraseña</label>
        <input
          type="password"
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-900 py-2.5 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
