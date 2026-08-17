import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const { name, active, password } = await request.json();

  const data: { name?: string; active?: boolean; passwordHash?: string } = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof active === "boolean") data.active = active;
  if (typeof password === "string" && password.trim()) {
    data.passwordHash = await hashPassword(password.trim());
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, username: true, role: true, active: true, createdAt: true },
  });

  return NextResponse.json({ employee: user });
}
