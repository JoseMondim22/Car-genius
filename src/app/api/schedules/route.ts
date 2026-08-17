import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const userId = request.nextUrl.searchParams.get("userId");

  const schedules = await prisma.schedule.findMany({
    where: userId ? { userId } : undefined,
    orderBy: [{ userId: "asc" }, { date: "asc" }, { dayOfWeek: "asc" }],
  });

  return NextResponse.json({ schedules });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { userId, startTime, endTime, dayOfWeek, date } = await request.json();

  if (!userId || !startTime || !endTime || (typeof dayOfWeek !== "number" && !date)) {
    return NextResponse.json({ error: "Faltan datos del horario" }, { status: 400 });
  }

  const isOverride = Boolean(date);
  const parsedDate = isOverride ? new Date(date) : null;
  const resolvedDayOfWeek = isOverride ? parsedDate!.getUTCDay() : dayOfWeek;

  const existing = await prisma.schedule.findFirst({
    where: isOverride ? { userId, date: parsedDate } : { userId, dayOfWeek, date: null },
  });

  const data = { userId, dayOfWeek: resolvedDayOfWeek, date: parsedDate, startTime, endTime };

  const schedule = existing
    ? await prisma.schedule.update({ where: { id: existing.id }, data })
    : await prisma.schedule.create({ data });

  return NextResponse.json({ schedule }, { status: existing ? 200 : 201 });
}
