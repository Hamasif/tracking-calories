export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.mealItem.findUnique({
    where: { id: params.id },
    include: { food: true },
  });

  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.mealItem.delete({ where: { id: params.id } });

  await prisma.mealLog.update({
    where: { id: item.mealLogId },
    data: {
      totalCalorie: {
        decrement: item.food.estimatedCalorie * item.quantity,
      },
    },
  });

  return Response.json({ success: true });
}