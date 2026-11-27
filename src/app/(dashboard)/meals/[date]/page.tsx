"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronLeft, Download, Plus, Trash2 } from "lucide-react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MealItem {
  id: string
  quantity: number
  mealType: string
  food: {
    name: string
    estimatedCalorie: number
    protein: number
    carbs: number
    fat: number
    imageUrl: string | null
  }
}

const MEAL_TYPE_META: Record<string, { label: string; emoji: string }> = {
  sarapan: { label: "Sarapan", emoji: "🌅" },
  siang: { label: "Makan siang", emoji: "☀️" },
  malam: { label: "Makan malam", emoji: "🌙" },
  snack: { label: "Snack", emoji: "🍬" },
}

export default function MealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const date = String(params.date)
  const [items, setItems] = useState<MealItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [date])

  async function loadData() {
    try {
      const res = await fetch(`/api/meal-logs?date=${date}`)
      const data = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Hapus makanan ini?")) return
    await fetch(`/api/meal-items/${id}`, { method: "DELETE" })
    loadData()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="h-48 animate-pulse rounded-3xl bg-white/70 shadow-soft lg:col-span-2" />
        <div className="h-48 animate-pulse rounded-3xl bg-white/70 shadow-soft" />
      </div>
    )
  }

  const macros = items.reduce(
    (acc, i) => ({
      protein: acc.protein + i.food.protein * i.quantity,
      carbs: acc.carbs + i.food.carbs * i.quantity,
      fat: acc.fat + i.food.fat * i.quantity,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  )

  const grouped = items.reduce<Record<string, MealItem[]>>((acc, item) => {
    if (!acc[item.mealType]) acc[item.mealType] = []
    acc[item.mealType].push(item)
    return acc
  }, {})

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/meals")}
          aria-label="Kembali"
          className="bg-white shadow-soft"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold tracking-tight text-ink md:text-2xl">
            {dateLabel}
          </h2>
          <p className="text-sm text-ink-soft">Detail catatan makan harian</p>
        </div>
        {items.length > 0 && (
          <a
            href={`/api/export?from=${date}&to=${date}`}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-soft transition-colors hover:bg-canvas"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center p-10 text-center">
          <span className="mb-3 text-4xl">🍱</span>
          <h3 className="text-base font-bold text-ink">Belum ada makanan</h3>
          <p className="mb-4 text-sm text-ink-soft">
            Yuk catat makanan pertama untuk tanggal ini.
          </p>
          <Button onClick={() => router.push("/scan")}>
            <Plus className="h-4 w-4" /> Scan Makanan
          </Button>
        </Card>
      ) : (
        <>
          {/* Kartu total */}
          <div className="rounded-3xl bg-ink p-6 text-white shadow-card">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">Total kalori</p>
                <p className="text-4xl font-bold tracking-tight">
                  {total.toLocaleString("id-ID")}
                  <span className="ml-1 text-base font-medium text-white/60">kal</span>
                </p>
              </div>
              <Button
                onClick={() => router.push("/scan")}
                className="bg-brand-500 hover:bg-brand-400"
              >
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Protein", macros.protein, "bg-stat-blue/20"],
                ["Karbo", macros.carbs, "bg-stat-amber/20"],
                ["Lemak", macros.fat, "bg-stat-violet/20"],
              ].map(([label, value, tone]) => (
                <div
                  key={label as string}
                  className={`rounded-2xl p-3 text-center ${tone as string}`}
                >
                  <p className="text-lg font-bold">{Math.round((value as number) * 10) / 10}g</p>
                  <p className="text-xs text-white/60">{label as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grup per waktu makan */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Object.entries(grouped).map(([mealType, groupItems]) => {
              const meta = MEAL_TYPE_META[mealType] ?? { label: mealType, emoji: "🍱" }
              const kcal = groupItems.reduce(
                (s, i) => s + i.food.estimatedCalorie * i.quantity,
                0
              )
              return (
                <Card key={mealType} className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-canvas text-lg">
                      {meta.emoji}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-ink">{meta.label}</h3>
                      <p className="text-xs text-ink-soft">{kcal} kalori</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl bg-canvas/70 p-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white shadow-soft">
                          {item.food.imageUrl ? (
                            <NextImage
                              src={item.food.imageUrl}
                              alt={item.food.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-lg">🍱</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">{item.food.name}</p>
                          <p className="text-xs text-ink-soft">
                            {item.food.estimatedCalorie} kal × {item.quantity} porsi ·{" "}
                            {Math.round(item.food.protein * item.quantity * 10) / 10}P
                          </p>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-stat-rose/10 hover:text-stat-rose"
                          aria-label={`Hapus ${item.food.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}