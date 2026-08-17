import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const employees = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true, role: true, active: true, createdAt: true },
  });

  return NextResponse.json({ employees });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { name, username, password, role } = await request.json();

  if (!name || !username || !password) {
    return NextResponse.json({ error: "Nombre, usuario y contraseña son requeridos" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Ese usuario ya existe" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      username,
      passwordHash,
      role: role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
    },
    select: { id: true, name: true, username: true, role: true, active: true, createdAt: true },
  });

  return NextResponse.json({ employee: user }, { status: 201 });
}
