export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST(req: Request) {
  const body = await req.json();
  const { foodId, quantity = 1, date, mealType } = body;

  const d = new Date(date ?? new Date());
  d.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  let mealLog = await prisma.mealLog.findFirst({
    where: {
      userId: DEFAULT_USER_ID,
      date: { gte: d, lte: end },
      mealType: mealType ?? "sarapan",
    },
  });

  if (!mealLog) {
    mealLog = await prisma.mealLog.create({
      data: {
        userId: DEFAULT_USER_ID,
        date: d,
        mealType: mealType ?? "sarapan",
        totalCalorie: 0,
      },
    });
  }

  const food = await prisma.food.findUnique({ where: { id: foodId } });
  if (!food) {
    return Response.json({ error: "Food not found" }, { status: 404 });
  }

  const item = await prisma.mealItem.create({
    data: {
      mealLogId: mealLog.id,
      foodId,
      quantity: Number(quantity) || 1,
    },
  });

  const newTotal = mealLog.totalCalorie + food.estimatedCalorie * (Number(quantity) || 1);
  await prisma.mealLog.update({
    where: { id: mealLog.id },
    data: { totalCalorie: newTotal },
  });

  return Response.json(item, { status: 201 });
}