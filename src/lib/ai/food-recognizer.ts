import { z } from "zod"

export type MealCategory = "sarapan" | "siang" | "malam" | "snack"

export interface FoodGuess {
  name: string
  estimatedCalorie: number
  portion: string | null
  protein: number | null
  carbs: number | null
  fat: number | null
  category: MealCategory | null
  confidence: number | null
}

export interface FoodPlateRecognition {
  items: FoodGuess[]
  totalCalorie: number | null
  source: "groq" | "fallback"
  message: string | null
}

const MEAL_CATEGORIES: MealCategory[] = ["sarapan", "siang", "malam", "snack"]

const FoodGuessSchema = z.object({
  name: z.string().min(1),
  estimatedCalorie: z.number().int().nonnegative(),
  portion: z.string().nullable().optional(),
  protein: z.number().nonnegative().nullable().optional(),
  carbs: z.number().nonnegative().nullable().optional(),
  fat: z.number().nonnegative().nullable().optional(),
  category: z.enum(["sarapan", "siang", "malam", "snack"]).nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
})

const FoodPlateSchema = z.object({
  items: z.array(FoodGuessSchema),
  totalCalorie: z.number().int().nonnegative().nullable().optional(),
})

const SYSTEM_PROMPT = `Kamu adalah asisten nutrisi. Analisis foto makanan yang diberikan.
Foto bisa berisi SATU PIRING LENGKAP (karbohidrat + lauk + sayur). Tugasmu adalah MENGURAI SETIAP
KOMPONEN menjadi item makanan terpisah — jangan mencampur semuanya dalam satu item.
Contoh: foto berisi nasi putih, ayam goreng, dan tumis kangkung harus menghasilkan 3 item:
nasi putih (~200 kal per centong), ayam goreng 1 potong (~250 kal), tumis kangkung (~80 kal).

Balas HANYA dengan JSON valid (tanpa markdown, tanpa penjelasan) dengan format:
{
  "items": [
    {
      "name": "nama makanan dalam Bahasa Indonesia",
      "estimatedCalorie": estimasi kalori integer untuk porsi pada foto,
      "portion": "deskripsi porsi, mis. '1 centong', '1 potong sedang', 'setengah piring'",
      "protein": estimasi protein gram (desimal),
      "carbs": estimasi karbohidrat gram (desimal)",
      "fat": estimasi lemak gram (desimal)",
      "category": satu dari "sarapan"|"siang"|"malam"|"snack",
      "confidence": angka 0 sampai 1
    }
  ],
  "totalCalorie": jumlah estimasi kalori semua item
}
Kalori dan makro bersifat perkiraan berdasarkan porsi umum makanan Indonesia.
Jika BUKAN makanan, kembalikan { "items": [], "totalCalorie": null }.`

function fallbackResult(message: string): FoodPlateRecognition {
  return { items: [], totalCalorie: null, source: "fallback", message }
}

export async function recognizeFoodPlate(
  base64DataUrl: string
): Promise<FoodPlateRecognition> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return fallbackResult(
      "AI belum dikonfigurasi (GROQ_API_KEY kosong). Anda tetap bisa menambah item manual di bawah."
    )
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_VISION_MODEL ?? "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Uraikan semua komponen makanan pada foto ini:" },
              { type: "image_url", image_url: { url: base64DataUrl } },
            ],
          },
        ],
        temperature: 0.2,
        max_completion_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error(`[recognizeFoodPlate] Groq API ${res.status}: ${detail.slice(0, 300)}`)
      if (res.status === 401) {
        return fallbackResult("API key Groq tidak valid. Periksa GROQ_API_KEY di .env.")
      }
      if (res.status === 429) {
        return fallbackResult("Groq rate limit tercapai. Tunggu sebentar lalu coba lagi.")
      }
      return fallbackResult("Deteksi AI gagal. Silakan isi manual.")
    }

    const data = await res.json()
    const raw: string = data.choices?.[0]?.message?.content ?? ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Respons AI tidak mengandung JSON")

    const parsed = FoodPlateSchema.parse(JSON.parse(jsonMatch[0]))

    if (parsed.items.length === 0) {
      return {
        items: [],
        totalCalorie: null,
        source: "groq",
        message: "AI tidak mendeteksi makanan pada foto ini. Coba foto yang lebih jelas.",
      }
    }

    return {
      items: parsed.items
        .map((item) => ({
          name: item.name,
          estimatedCalorie: item.estimatedCalorie,
          portion: item.portion ?? null,
          protein: item.protein ?? null,
          carbs: item.carbs ?? null,
          fat: item.fat ?? null,
          category: normalizeCategory(item.category),
          confidence: item.confidence ?? null,
        }))
        .slice(0, 12),
      totalCalorie:
        parsed.totalCalorie ??
        parsed.items.reduce((sum, i) => sum + i.estimatedCalorie, 0),
      source: "groq",
      message: null,
    }
  } catch (err) {
    console.error("[recognizeFoodPlate]", err)
    return fallbackResult("Deteksi AI gagal. Silakan isi manual.")
  }
}

function normalizeCategory(value: string | null | undefined): MealCategory | null {
  return MEAL_CATEGORIES.includes(value as MealCategory) ? (value as MealCategory) : null
}