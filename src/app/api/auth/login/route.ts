import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, role: user.role, name: user.name });
  await setSessionCookie(token);

  return NextResponse.json({ role: user.role });
}
