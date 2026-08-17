"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import type { SessionPayload } from "@/lib/auth";

const employeeLinks = [{ href: "/dashboard", label: "Mi horario" }];

const adminLinks = [
  { href: "/admin", label: "Reportes" },
  { href: "/admin/employees", label: "Trabajadores" },
  { href: "/admin/schedules", label: "Horarios" },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-blue-50 text-blue-600" : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-blue-500" : "bg-transparent"}`} />
      {label}
    </Link>
  );
}

export default function AppShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-lg font-black leading-tight tracking-tight text-red-600">AUTO CARE</p>
          <p className="text-lg font-black leading-tight tracking-tight text-neutral-900">GENIUS</p>
        </div>

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Operations
        </p>
        <nav className="mb-6 flex flex-col gap-1">
          {employeeLinks.map((link) => (
            <NavLink key={link.href} {...link} active={pathname === link.href} />
          ))}
        </nav>

        {session.role === "ADMIN" && (
          <>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Admin
            </p>
            <nav className="flex flex-col gap-1">
              {adminLinks.map((link) => (
                <NavLink key={link.href} {...link} active={pathname === link.href} />
              ))}
            </nav>
          </>
        )}
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-neutral-200 bg-white px-6 py-3">
          <span className="text-sm font-medium text-neutral-700">{session.name}</span>
          <LogoutButton />
        </header>

        <main className="flex-1 bg-neutral-50 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
