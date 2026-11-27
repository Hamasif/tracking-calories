export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

const REMINDER_ID = "default";

export async function GET() {
  const setting = await prisma.reminderSetting.findUnique({ where: { id: REMINDER_ID } });
  if (!setting) {
    return Response.json({ enabled: false, breakfastTime: "07:00", lunchTime: "12:00", dinnerTime: "18:00" });
  }
  return Response.json(setting);
}

export async function POST(req: Request) {
  const body = await req.json();
  const setting = await prisma.reminderSetting.upsert({
    where: { id: REMINDER_ID },
    update: {
      enabled: Boolean(body.enabled),
      breakfastTime: body.breakfastTime ?? "07:00",
      lunchTime: body.lunchTime ?? "12:00",
      dinnerTime: body.dinnerTime ?? "18:00",
    },
    create: {
      id: REMINDER_ID,
      enabled: Boolean(body.enabled),
      breakfastTime: body.breakfastTime ?? "07:00",
      lunchTime: body.lunchTime ?? "12:00",
      dinnerTime: body.dinnerTime ?? "18:00",
    },
  });
  return Response.json(setting);
}