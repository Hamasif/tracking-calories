export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const foods = await prisma.food.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(foods);
}

export async function POST(req: Request) {
  const body = await req.json();
  const food = await prisma.food.create({
    data: {
      name: body.name,
      estimatedCalorie: Number(body.estimatedCalorie) || 0,
      category: body.category,
      imageUrl: body.imageUrl || null,
      protein: Number(body.protein) || 0,
      carbs: Number(body.carbs) || 0,
      fat: Number(body.fat) || 0,
    },
  });
  return Response.json(food, { status: 201 });
}