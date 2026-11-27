export const dynamic = "force-dynamic";

import { writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";

const ScanItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  estimatedCalorie: z.number().int().nonnegative(),
  portion: z.string().trim().max(60).nullable().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  quantity: z.number().int().positive().default(1),
});

const ScanSchema = z.object({
  items: z.array(ScanItemSchema).min(1).max(12),
  image: z.string().startsWith("data:image").nullable().optional(),
  date: z.string().optional(),
  mealType: z.enum(["sarapan", "siang", "malam", "snack"]).default("snack"),
});

/**
 * Simpan foto sekali, dipakai oleh semua item dari scan ini.
 * - Produksi (Vercel): upload ke Vercel Blob (butuh BLOB_READ_WRITE_TOKEN)
 * - Dev lokal: tulis ke public/uploads (filesystem lokal masih writable)
 */
async function saveImage(dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;

  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const ext = mime === "jpeg" ? "jpg" : mime;
  const fileName = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(fileName, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: `image/${mime}`,
    });
    return blob.url;
  }

  const filePath = path.join(process.cwd(), "public", "uploads", fileName);
  await writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ScanSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Data tidak valid. Minimal 1 item dengan nama & kalori." },
      { status: 400 }
    );
  }

  const { items, image, date, mealType } = parsed.data;

  let imagePath: string | null = null;
  if (image) {
    try {
      imagePath = await saveImage(image);
    } catch (err) {
      console.error("[api/scan] gagal simpan foto:", err);
      // Foto gagal disimpan tidak boleh membatalkan pencatatan makanan
    }
  }

  const d = new Date(date ?? new Date());
  d.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  try {
    const result = await prisma.$transaction(async (tx) => {
      let mealLog = await tx.mealLog.findFirst({
        where: { userId: DEFAULT_USER_ID, date: { gte: d, lte: end }, mealType },
      });

      if (!mealLog) {
        mealLog = await tx.mealLog.create({
          data: { userId: DEFAULT_USER_ID, date: d, mealType, totalCalorie: 0 },
        });
      }

      const created: { id: string; name: string; estimatedCalorie: number }[] = [];
      let addedCalorie = 0;

      for (const item of items) {
        const food = await tx.food.create({
          data: {
            name: item.name,
            estimatedCalorie: item.estimatedCalorie,
            category: mealType,
            imageUrl: imagePath,
            protein: item.protein ?? 0,
            carbs: item.carbs ?? 0,
            fat: item.fat ?? 0,
          },
        });

        await tx.mealItem.create({
          data: { mealLogId: mealLog.id, foodId: food.id, quantity: item.quantity },
        });

        addedCalorie += item.estimatedCalorie * item.quantity;
        created.push({
          id: food.id,
          name: item.name,
          estimatedCalorie: item.estimatedCalorie,
        });
      }

      await tx.mealLog.update({
        where: { id: mealLog.id },
        data: { totalCalorie: mealLog.totalCalorie + addedCalorie },
      });

      return { created, addedCalorie };
    });

    return Response.json(
      {
        items: result.created,
        totalCalorie: result.addedCalorie,
        imageUrl: imagePath,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/scan]", err);
    return Response.json({ error: "Gagal menyimpan makanan" }, { status: 500 });
  }
}