export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 6 hari ke belakang + hari ini = 7 titik
  const start = new Date(today);
  start.setDate(start.getDate() - 6);

  const logs = await prisma.mealLog.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      date: { gte: start, lte: today },
    },
    include: { items: { include: { food: true } } },
  });

  const days: { date: string; label: string; total: number; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d.toISOString().split("T")[0],
      label: DAY_LABELS[d.getDay()],
      total: 0,
      isToday: d.getTime() === today.getTime(),
    });
  }

  const dayMap = new Map(days.map((d) => [d.date, d]));
  for (const log of logs) {
    const key = log.date.toISOString().split("T")[0];
    const day = dayMap.get(key);
    if (!day) continue;
    day.total += log.items.reduce(
      (sum, i) => sum + i.food.estimatedCalorie * i.quantity,
      0
    );
  }

  const values = days.map((d) => d.total);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return Response.json({ days, average, max: Math.max(...values, 1) });
}