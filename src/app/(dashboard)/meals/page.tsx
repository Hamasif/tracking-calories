"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const MEAL_TYPES = [
  { value: "sarapan", label: "Sarapan", emoji: "🌅", desc: "07.00 - 09.00" },
  { value: "siang", label: "Makan siang", emoji: "☀️", desc: "12.00 - 13.00" },
  { value: "malam", label: "Makan malam", emoji: "🌙", desc: "18.00 - 19.00" },
  { value: "snack", label: "Snack", emoji: "🍬", desc: "Kapan saja" },
]

export default function MealsPage() {
  const [date, setDate] = useState("")
  const [mealType, setMealType] = useState("sarapan")
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]

  async function handleCreate(targetDate?: string) {
    const d = targetDate ?? date
    if (!d) return
    await fetch("/api/meal-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: d, mealType }),
    })
    router.push(`/meals/${d}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Jadwal Makan</h2>
        <p className="text-sm text-ink-soft">
          Buat jadwal baru atau lanjutkan catatan makan hari ini
        </p>
      </div>

      {/* Jadwal hari ini */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-faint">
          Hari ini
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt.value}
              onClick={() => {
                setMealType(mt.value)
                handleCreate(today)
              }}
              className="group rounded-3xl bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas text-xl">
                {mt.emoji}
              </span>
              <p className="font-bold text-ink">{mt.label}</p>
              <p className="text-xs text-ink-soft">{mt.desc}</p>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-700">
                <Plus className="h-3.5 w-3.5" /> Buka jadwal
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form jadwal custom */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Buat Jadwal Baru</h3>
            <p className="text-xs text-ink-soft">Pilih tanggal dan waktu makan</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Tanggal</label>
            <Input
              type="date"
              value={date || today}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Waktu Makan</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => setMealType(mt.value)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 text-sm font-semibold transition-all ${
                    mealType === mt.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-black/5 bg-white text-ink-soft hover:border-brand-200"
                  }`}
                >
                  <span className="text-xl">{mt.emoji}</span>
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => handleCreate()} className="w-full py-3 sm:w-auto">
            <Plus className="h-4 w-4" /> Buat Jadwal
          </Button>
        </div>
      </Card>
    </div>
  )
}