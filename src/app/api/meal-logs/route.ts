export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

function dayBounds(dateStr: string) {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const { start, end } = dayBounds(dateStr);

  const logs = await prisma.mealLog.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      date: { gte: start, lte: end },
    },
    include: { items: { include: { food: true } } },
    orderBy: { mealType: "asc" },
  });

  const items = logs.flatMap((log) =>
    log.items.map((item) => ({ ...item, mealType: log.mealType }))
  );

  let total = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const i of items) {
    total += i.food.estimatedCalorie * i.quantity;
    protein += i.food.protein * i.quantity;
    carbs += i.food.carbs * i.quantity;
    fat += i.food.fat * i.quantity;
  }

  const macros = {
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };

  return Response.json({ items, total, macros, logs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { date, mealType } = body;
  const { start, end } = dayBounds(date);

  const existing = await prisma.mealLog.findFirst({
    where: {
      userId: DEFAULT_USER_ID,
      date: { gte: start, lte: end },
      mealType,
    },
  });

  if (existing) return Response.json(existing);

  const log = await prisma.mealLog.create({
    data: {
      userId: DEFAULT_USER_ID,
      date: start,
      mealType,
      totalCalorie: 0,
    },
  });
  return Response.json(log, { status: 201 });
}