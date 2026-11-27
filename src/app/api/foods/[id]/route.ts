export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.food.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}