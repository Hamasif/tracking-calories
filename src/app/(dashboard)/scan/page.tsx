"use client"

import { Suspense, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NextImage from "next/image"
import {
  Camera,
  Check,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { fileToCompressedDataUrl } from "@/lib/resize-image"

const CATEGORIES = [
  { value: "sarapan", label: "Sarapan", emoji: "🌅" },
  { value: "siang", label: "Siang", emoji: "☀️" },
  { value: "malam", label: "Malam", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍬" },
]

interface EditableItem {
  key: string
  name: string
  calorie: string
  portion: string
  protein: string
  carbs: string
  fat: string
  quantity: number
  confidence: number | null
}

function newItem(): EditableItem {
  return {
    key: crypto.randomUUID(),
    name: "",
    calorie: "",
    portion: "",
    protein: "",
    carbs: "",
    fat: "",
    quantity: 1,
    confidence: null,
  }
}

function toNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function totalsOf(items: EditableItem[]) {
  return items.reduce(
    (acc, i) => ({
      calorie: acc.calorie + toNumber(i.calorie) * i.quantity,
      protein: acc.protein + toNumber(i.protein) * i.quantity,
      carbs: acc.carbs + toNumber(i.carbs) * i.quantity,
      fat: acc.fat + toNumber(i.fat) * i.quantity,
    }),
    { calorie: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-soft">Memuat...</div>}>
      <ScanContent />
    </Suspense>
  )
}

function ScanContent() {
  const [step, setStep] = useState<"camera" | "review" | "result">("camera")
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [items, setItems] = useState<EditableItem[]>([])
  const searchParams = useSearchParams()
  const initialType =
    CATEGORIES.find((c) => c.value === searchParams.get("type"))?.value ?? "sarapan"
  const [mealType, setMealType] = useState(initialType)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiMessage, setAiMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedSummary, setSavedSummary] = useState<{ count: number; calorie: number } | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const totals = totalsOf(items)
  const validItems = items.filter((i) => i.name.trim() && toNumber(i.calorie) > 0)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const compressed = await fileToCompressedDataUrl(file)
    setImageSrc(compressed)
    setAiMessage(null)
  }

  async function handleAnalyze() {
    if (!imageSrc) return
    setAnalyzing(true)
    setAiMessage(null)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      })
      const data = await res.json()
      const detected: EditableItem[] = (data.items ?? []).map(
        (item: {
          name: string
          estimatedCalorie: number
          portion: string | null
          protein: number | null
          carbs: number | null
          fat: number | null
          confidence: number | null
        }) => ({
          key: crypto.randomUUID(),
          name: item.name,
          calorie: String(item.estimatedCalorie ?? ""),
          portion: item.portion ?? "",
          protein: item.protein != null ? String(item.protein) : "",
          carbs: item.carbs != null ? String(item.carbs) : "",
          fat: item.fat != null ? String(item.fat) : "",
          quantity: 1,
          confidence: item.confidence ?? null,
        })
      )

      if (detected.length > 0) {
        setItems(detected)
        setStep("review")
      } else {
        setAiMessage(
          data.message ??
            "AI tidak mendeteksi makanan. Anda bisa tambah item manual di bawah."
        )
      }
    } catch {
      setAiMessage("Deteksi AI gagal. Silakan isi manual.")
    } finally {
      setAnalyzing(false)
    }
  }

  function addManualRow() {
    setItems((prev) => [...prev, newItem()])
    setStep("review")
  }

  function updateItem(key: string, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))
  }

  async function handleSave() {
    if (validItems.length === 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          image: imageSrc,
          items: validItems.map((i) => ({
            name: i.name.trim(),
            estimatedCalorie: toNumber(i.calorie),
            portion: i.portion.trim() || null,
            protein: toNumber(i.protein),
            carbs: toNumber(i.carbs),
            fat: toNumber(i.fat),
            quantity: i.quantity,
          })),
        }),
      })
      if (!res.ok) throw new Error("Gagal menyimpan")
      const data = await res.json()
      setSavedSummary({
        count: data.items?.length ?? validItems.length,
        calorie: data.totalCalorie ?? totals.calorie,
      })
      setStep("result")
    } catch (err) {
      console.error(err)
      alert("Gagal menyimpan makanan")
    } finally {
      setSaving(false)
    }
  }

  function resetAll() {
    setStep("camera")
    setImageSrc(null)
    setItems([])
    setAiMessage(null)
    setSavedSummary(null)
  }

  /* ============ LAYAR SUKSES ============ */
  if (step === "result") {
    return (
      <div className="mx-auto max-w-md">
        <Card className="animate-fade-up p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Tersimpan!</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {savedSummary?.count ?? 0} item berhasil dicatat ke jadwal hari ini
          </p>
          <div className="mt-6 rounded-2xl bg-canvas/70 p-5">
            <p className="text-3xl font-bold tracking-tight text-ink">
              {(savedSummary?.calorie ?? 0).toLocaleString("id-ID")}
              <span className="ml-1 text-sm font-medium text-ink-soft">kal total</span>
            </p>
            <p className="text-sm text-ink-soft">Foto tersimpan di setiap item menu</p>
          </div>
          <div className="mt-6 space-y-2">
            <Button onClick={resetAll} className="w-full py-3">
              <Camera className="h-4 w-4" /> Scan Lagi
            </Button>
            <Button variant="outline" onClick={() => router.push("/meals")} className="w-full py-3">
              Lihat Jadwal
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ============ LAYAR REVIEW DAFTAR ITEM ============ */
  if (step === "review") {
    return (
      <div className="mx-auto max-w-3xl space-y-5 pb-40 sm:pb-32">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Hasil Scan</h2>
            <p className="text-sm text-ink-soft">
              Periksa, edit, dan lengkapi setiap item sebelum disimpan
            </p>
          </div>
          {imageSrc && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-canvas shadow-soft">
              <NextImage
                src={imageSrc}
                alt="Makanan"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
        </div>

        {/* Daftar item */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.key} className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {index + 1}
                </span>
                <Input
                  placeholder="Nama item (mis. Nasi putih)"
                  value={item.name}
                  onChange={(e) => updateItem(item.key, { name: e.target.value })}
                  className="flex-1"
                />
                {item.confidence != null && (
                  <span className="hidden shrink-0 rounded-full bg-canvas px-2 py-1 text-[11px] font-semibold text-ink-soft sm:block">
                    keyakinan {Math.round(item.confidence * 100)}%
                  </span>
                )}
                <button
                  onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-stat-rose/10 hover:text-stat-rose"
                  aria-label="Hapus item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-ink-soft">Kalori</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.calorie}
                      onChange={(e) => updateItem(item.key, { calorie: e.target.value })}
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
                      kal
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-ink-soft">Porsi</label>
                  <Input
                    placeholder="1 centong"
                    value={item.portion}
                    onChange={(e) => updateItem(item.key, { portion: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-ink-soft">Jumlah</label>
                  <div className="flex h-11 items-center rounded-2xl border border-black/10 bg-white shadow-soft">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(item.key, { quantity: Math.max(1, item.quantity - 1) })
                      }
                      className="h-full w-9 text-lg font-bold text-ink-soft hover:text-ink"
                      aria-label="Kurangi"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItem(item.key, { quantity: item.quantity + 1 })}
                      className="h-full w-9 text-lg font-bold text-ink-soft hover:text-ink"
                      aria-label="Tambah"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-2 sm:col-span-1">
                  {(
                    [
                      ["Protein", "protein"],
                      ["Karbo", "carbs"],
                      ["Lemak", "fat"],
                    ] as const
                  ).map(([label, field]) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] font-semibold text-ink-soft">{label}</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={item[field]}
                        onChange={(e) => updateItem(item.key, { [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          <button
            onClick={addManualRow}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-black/10 bg-white/60 py-4 text-sm font-semibold text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <Plus className="h-4 w-4" /> Tambah Item Manual
          </button>
        </div>

        {/* Waktu makan */}
        <Card className="p-4">
          <p className="mb-3 text-sm font-semibold text-ink">Waktu Makan</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setMealType(cat.value)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-2.5 text-xs font-semibold transition-all ${
                  mealType === cat.value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-black/5 bg-white text-ink-soft hover:border-brand-200"
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Ringkasan + simpan (sticky bawah) */}
        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-black/5 bg-white/95 p-4 backdrop-blur-md md:bottom-0 md:left-[84px] lg:left-64">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-ink-soft">
                Total {validItems.length} item · {Math.round(totals.protein * 10) / 10}P ·{" "}
                {Math.round(totals.carbs * 10) / 10}K · {Math.round(totals.fat * 10) / 10}L
              </p>
              <p className="text-2xl font-bold tracking-tight text-ink">
                {Math.round(totals.calorie).toLocaleString("id-ID")}
                <span className="ml-1 text-xs font-medium text-ink-soft">kal total</span>
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || validItems.length === 0}
              className="flex-1 py-3 sm:flex-none"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Simpan Semua ({validItems.length})
                </>
              )}
            </Button>
          </div>
        </div>

        <button
          onClick={() => setStep("camera")}
          className="mx-auto flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Ganti foto
        </button>
      </div>
    )
  }

  /* ============ LAYAR FOTO ============ */
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Scan Makanan</h2>
        <p className="text-sm text-ink-soft">
          Foto satu piring — AI akan menguraikan nasi, lauk, dan sayur per item
        </p>
      </div>

      <Card className="p-5">
        {imageSrc ? (
          <div className="relative">
            <div className="relative h-64 overflow-hidden rounded-2xl bg-canvas shadow-soft">
              <NextImage
                src={imageSrc}
                alt="Makanan"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
            <button
              onClick={() => setImageSrc(null)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition-colors hover:bg-white"
              aria-label="Hapus foto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-canvas/60 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft">
                <Camera className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-ink">Ambil Foto</p>
              <p className="text-xs text-ink-soft">Gunakan kamera</p>
            </button>
            <button
              onClick={() => document.getElementById("gallery-input")?.click()}
              className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-canvas/60 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-soft shadow-soft">
                <ImageIcon className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-ink">Pilih dari Galeri</p>
              <p className="text-xs text-ink-soft">Foto tersimpan di ponsel</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageChange}
            />
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        )}

        <div className="mt-4 space-y-3">
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !imageSrc}
            className="w-full py-3"
          >
            {analyzing ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Mendeteksi makanan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Deteksi dengan AI
              </>
            )}
          </Button>

          {aiMessage && (
            <div className="flex gap-2 rounded-2xl border border-stat-amber/30 bg-stat-amber/10 p-3 text-sm text-ink">
              <span>✨</span>
              <span>{aiMessage}</span>
            </div>
          )}

          <button
            onClick={addManualRow}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 text-sm font-semibold text-ink-soft shadow-soft transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" /> Tambah Item Manual (tanpa AI)
          </button>
        </div>
      </Card>

      {/* Info cara kerja */}
      <Card className="bg-canvas/70 p-5 shadow-soft">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
          <Sparkles className="h-4 w-4 text-stat-amber" /> Cara kerja deteksi AI
        </h3>
        <ul className="space-y-1.5 text-sm text-ink-soft">
          <li>• 1 foto = 1 piring; AI menguraikan nasi, lauk, dan sayur jadi item terpisah</li>
          <li>• Kalori & makro = estimasi AI untuk porsi umum — Anda bisa edit manual</li>
          <li>• Foto akan tersimpan dan tercatat di setiap item menu harian</li>
          <li>• Butuh GROQ_API_KEY di .env untuk mengaktifkan AI (tanpa itu tetap bisa input manual)</li>
        </ul>
      </Card>

      <button
        onClick={() => router.back()}
        className="mx-auto flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        Kembali
      </button>
    </div>
  )
}