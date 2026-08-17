import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const openEntry = await prisma.timeEntry.findFirst({
    where: { userId: session.userId, clockOut: null },
    orderBy: { clockIn: "desc" },
  });

  if (openEntry) {
    const updated = await prisma.timeEntry.update({
      where: { id: openEntry.id },
      data: { clockOut: new Date() },
    });
    return NextResponse.json({ status: "clocked_out", entry: updated });
  }

  const created = await prisma.timeEntry.create({
    data: { userId: session.userId, clockIn: new Date() },
  });
  return NextResponse.json({ status: "clocked_in", entry: created });
}
