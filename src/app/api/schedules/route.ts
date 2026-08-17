import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const userId = request.nextUrl.searchParams.get("userId");

  const schedules = await prisma.schedule.findMany({
    where: userId ? { userId } : undefined,
    orderBy: [{ userId: "asc" }, { dayOfWeek: "asc" }],
  });

  return NextResponse.json({ schedules });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { userId, dayOfWeek, startTime, endTime } = await request.json();

  if (!userId || typeof dayOfWeek !== "number" || !startTime || !endTime) {
    return NextResponse.json({ error: "Faltan datos del horario" }, { status: 400 });
  }

  const schedule = await prisma.schedule.create({
    data: { userId, dayOfWeek, startTime, endTime },
  });

  return NextResponse.json({ schedule }, { status: 201 });
}
