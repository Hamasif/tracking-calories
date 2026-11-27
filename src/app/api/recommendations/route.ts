export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const [logs, user] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId: DEFAULT_USER_ID, date: { gte: today, lte: end } },
      include: { items: { include: { food: true } } },
    }),
    prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } }),
  ]);

  const consumed = logs.reduce(
    (sum, log) =>
      sum + log.items.reduce((s, i) => s + i.food.estimatedCalorie * i.quantity, 0),
    0
  );

  const target = user?.targetCalorie ?? 2000;
  const remaining = Math.max(0, target - consumed);

  // Rekomendasi: makanan ringan yang muat di sisa kalori, urut kalori naik
  const candidates = await prisma.food.findMany({
    where: { estimatedCalorie: { lte: remaining } },
    orderBy: { estimatedCalorie: "asc" },
    take: 6,
  });

  return Response.json({ remaining, consumed, target, recommendations: candidates });
}