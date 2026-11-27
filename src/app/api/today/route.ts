export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const logs = await prisma.mealLog.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      date: { gte: today, lte: end },
    },
    include: { items: { include: { food: true } } },
  });

  let total = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const log of logs) {
    for (const item of log.items) {
      total += item.food.estimatedCalorie * item.quantity;
      protein += item.food.protein * item.quantity;
      carbs += item.food.carbs * item.quantity;
      fat += item.food.fat * item.quantity;
    }
  }

  return Response.json({
    total,
    macros: {
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    },
  });
}