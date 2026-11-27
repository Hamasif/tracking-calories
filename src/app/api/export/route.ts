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
  const from = searchParams.get("from") ?? new Date().toISOString().split("T")[0];
  const to = searchParams.get("to") ?? from;
  const { start } = dayBounds(from);
  const { end } = dayBounds(to);

  const logs = await prisma.mealLog.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      date: { gte: start, lte: end },
    },
    include: { items: { include: { food: true } } },
    orderBy: { date: "asc" },
  });

  const rows: string[][] = [
    ["Tanggal", "Waktu Makan", "Makanan", "Porsi", "Kalori Total", "Protein (g)", "Karbo (g)", "Lemak (g)"],
  ];

  let totalKal = 0;
  let totalPro = 0;
  let totalCarb = 0;
  let totalFat = 0;

  for (const log of logs) {
    // Format tanggal lokal agar konsisten dengan yang disimpan (midnight lokal)
    const d = new Date(log.date);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    for (const item of log.items) {
      const kal = item.food.estimatedCalorie * item.quantity;
      totalKal += kal;
      totalPro += item.food.protein * item.quantity;
      totalCarb += item.food.carbs * item.quantity;
      totalFat += item.food.fat * item.quantity;
      rows.push([
        dateStr,
        log.mealType,
        item.food.name,
        String(item.quantity),
        String(kal),
        String(Math.round(item.food.protein * item.quantity * 10) / 10),
        String(Math.round(item.food.carbs * item.quantity * 10) / 10),
        String(Math.round(item.food.fat * item.quantity * 10) / 10),
      ]);
    }
  }

  rows.push([]);
  rows.push(["TOTAL", "", "", "", String(totalKal), String(Math.round(totalPro * 10) / 10), String(Math.round(totalCarb * 10) / 10), String(Math.round(totalFat * 10) / 10)]);

  const csv = rows
    .map((r) => r.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const fileName = from === to ? `laporan-kalori-${from}.csv` : `laporan-kalori-${from}-${to}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}