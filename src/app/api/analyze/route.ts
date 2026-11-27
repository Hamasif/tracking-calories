export const dynamic = "force-dynamic";

import { recognizeFoodPlate } from "@/lib/ai/food-recognizer";

export async function POST(req: Request) {
  let body: { image?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const image = body.image;
  if (typeof image !== "string" || !image.startsWith("data:image")) {
    return Response.json({ error: "Gambar tidak valid (harus data URL base64)" }, { status: 400 });
  }

  const result = await recognizeFoodPlate(image);
  return Response.json(result);
}