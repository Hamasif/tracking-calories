"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Beef,
  Croissant,
  Droplets,
  Flame,
  Plus,
  Salad,
  Utensils,
  Wheat,
} from "lucide-react"
import { Mascot } from "@/components/Mascot"
import { MacroBar } from "@/components/MacroBar"
import { ProgressRing } from "@/components/ProgressRing"
import { WeeklyChart } from "@/components/WeeklyChart"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMealReminder } from "@/lib/use-meal-reminder"

const MACRO_META = [
  { key: "protein", label: "Protein", target: 100, color: "bg-stat-blue", icon: <Beef className="h-4 w-4" /> },
  { key: "carbs", label: "Karbo", target: 250, color: "bg-stat-amber", icon: <Wheat className="h-4 w-4" /> },
  { key: "fat", label: "Lemak", target: 65, color: "bg-stat-violet", icon: <Droplets className="h-4 w-4" /> },
] as const

const MEAL_ORDER = ["sarapan", "siang", "malam", "snack"]

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return "Selamat pagi"
  if (h < 15) return "Selamat siang"
  if (h < 19) return "Selamat sore"
  return "Selamat malam"
}

const MEAL_META: Record<string, { label: string; emoji: string; icon: typeof Utensils }> = {
  sarapan: { label: "Sarapan", emoji: "🌅", icon: Croissant },
  siang: { label: "Makan siang", emoji: "☀️", icon: Salad },
  malam: { label: "Makan malam", emoji: "🌙", icon: Utensils },
  snack: { label: "Snack", emoji: "🍬", icon: Flame },
}

interface Food {
  id: string
  name: string
  estimatedCalorie: number
  protein: number
  carbs: number
  fat: number
}

interface MealItem {
  id: string
  mealType: string
  quantity: number
  food: { name: string; estimatedCalorie: number }
}

export default function HomePage() {
  const [total, setTotal] = useState(0)
  const [target, setTarget] = useState(2000)
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [recommendations, setRecommendations] = useState<Food[]>([])
  const [weekly, setWeekly] = useState<{ date: string; label: string; total: number; isToday: boolean }[]>([])
  const [average, setAverage] = useState(0)
  const [mealItems, setMealItems] = useState<MealItem[]>([])
  const { reminderMessage } = useMealReminder()

  const load = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]
    const [todayRes, recRes, weeklyRes, logsRes] = await Promise.all([
      fetch("/api/today").then((r) => r.json()),
      fetch("/api/recommendations").then((r) => r.json()),
      fetch("/api/weekly").then((r) => r.json()),
      fetch(`/api/meal-logs?date=${today}`).then((r) => r.json()),
    ])
    setTotal(todayRes.total ?? 0)
    setMacros(todayRes.macros ?? { protein: 0, carbs: 0, fat: 0 })
    setTarget(recRes.target ?? 2000)
    setRecommendations(recRes.recommendations ?? [])
    setWeekly(weeklyRes.days ?? [])
    setAverage(weeklyRes.average ?? 0)
    setMealItems(logsRes.items ?? [])
  }, [])

  useEffect(() => {
    load().catch(() => {})
  }, [load])

  async function addFood(food: Food) {
    await fetch("/api/meal-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: food.id,
        quantity: 1,
        date: new Date().toISOString().split("T")[0],
        mealType: "snack",
      }),
    })
    await load()
  }

  const remaining = Math.max(0, target - total)
  const pct = target > 0 ? Math.round((total / target) * 100) : 0
  const status = total > target ? "warning" : "safe"

  const mealGroups = MEAL_ORDER.map((type) => ({
    type,
    ...MEAL_META[type],
    items: mealItems.filter((i) => i.mealType === type),
  }))

  const loggedDays = weekly.filter((d) => d.total > 0).length
  const todayLogged = total > 0

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Salam di HP (header mobile dibuat ringkas) */}
      <div className="md:hidden">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          {greeting()}, Bubub 👋
        </h2>
        <p className="text-sm text-ink-soft">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {reminderMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-stat-amber/30 bg-stat-amber/15 p-4 text-sm font-medium text-ink animate-fade-up">
          <span className="text-lg">⏰</span>
          <span>{reminderMessage}</span>
        </div>
      )}

      {/* ===== Baris 1: Ring kalori + progres minggu + makro ===== */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        {/* Ring kalori hari ini */}
        <Card className="animate-fade-up p-6 md:col-span-2 xl:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Asupan Hari Ini</h2>
              <p className="text-sm text-ink-soft">
                Target {target.toLocaleString("id-ID")} kalori
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                status === "warning"
                  ? "bg-stat-rose/15 text-stat-rose"
                  : "bg-brand-100 text-brand-700"
              }`}
            >
              {status === "warning" ? "Melebihi target" : "Aman"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <ProgressRing value={total} target={target} size={188} />
            <div className="grid w-full grid-cols-2 gap-3 sm:max-w-[190px]">
              <div className="rounded-2xl bg-canvas/70 p-3">
                <p className="text-xs text-ink-soft">Terkonsumsi</p>
                <p className="text-xl font-bold text-ink">{total.toLocaleString("id-ID")}</p>
              </div>
              <div className="rounded-2xl bg-canvas/70 p-3">
                <p className="text-xs text-ink-soft">Sisa</p>
                <p className="text-xl font-bold text-brand-600">{remaining.toLocaleString("id-ID")}</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-brand-600 p-3 text-white">
                <p className="text-xs text-brand-100">Progress</p>
                <p className="text-xl font-bold">{pct}% dari target</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Progres 7 hari */}
        <Card className="animate-fade-up p-6 xl:col-span-4" style={{ animationDelay: "80ms" }}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Progres 7 Hari</h2>
            <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink-soft">
              {loggedDays} hari tercatat
            </span>
          </div>

          <div className="flex justify-between gap-1.5">
            {weekly.map((day) => {
              const done = day.total > 0
              return (
                <div key={day.date} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      done
                        ? "bg-brand-500 text-white shadow-glow"
                        : day.isToday
                          ? "border-2 border-dashed border-brand-400 bg-white text-brand-600"
                          : "border-2 border-dashed border-black/10 bg-white text-ink-faint"
                    }`}
                    title={day.total > 0 ? `${day.total} kalori` : "Belum ada catatan"}
                  >
                    {day.label}
                  </div>
                  {day.isToday && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-canvas/70 p-3">
              <p className="text-xs text-ink-soft">Rata-rata</p>
              <p className="text-lg font-bold text-ink">{average} kal</p>
            </div>
            <div className="rounded-2xl bg-canvas/70 p-3">
              <p className="text-xs text-ink-soft">Hari ini</p>
              <p className="text-lg font-bold text-ink">
                {todayLogged ? `${total} kal` : "Belum diisi"}
              </p>
            </div>
          </div>

          <Link
            href="/meals"
            className="mt-4 flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Lihat jadwal makan
          </Link>
        </Card>

        {/* Makronutrisi */}
        <Card className="animate-fade-up p-6 md:col-span-2 xl:col-span-3" style={{ animationDelay: "160ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Makronutrisi</h2>
            <span className="text-xs text-ink-soft">Target harian</span>
          </div>
          <div className="space-y-3">
            {MACRO_META.map((m) => (
              <MacroBar
                key={m.key}
                label={m.label}
                value={macros[m.key]}
                target={m.target}
                unit="g"
                color={m.color}
                icon={m.icon}
              />
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Tetap seimbangkan protein, karbo, dan lemak — Bubub sedang mengawasi! 🩺
          </p>
        </Card>
      </div>

      {/* ===== Baris 2: Chart mingguan ===== */}
      <Card className="animate-fade-up p-6" style={{ animationDelay: "220ms" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-ink">Statistik Mingguan</h2>
            <p className="text-sm text-ink-soft">Kalori per hari, 7 hari terakhir</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Hari ini
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-200" /> Lainnya
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-stat-rose" /> Di atas target
            </span>
          </div>
        </div>
        <WeeklyChart days={weekly} target={target} />
      </Card>

      {/* ===== Baris 3: Makan hari ini ===== */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Makan Hari Ini</h2>
            <p className="text-sm text-ink-soft">Ringkasan kalori per waktu makan</p>
          </div>
          <Link
            href="/scan"
            className="hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 sm:flex"
          >
            <Plus className="h-4 w-4" /> Catat
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {mealGroups.map((meal) => {
            const kcal = meal.items.reduce((s, i) => s + i.food.estimatedCalorie * i.quantity, 0)
            return (
              <Card
                key={meal.type}
                className="animate-fade-up group p-4 transition-shadow hover:shadow-lift"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-canvas text-lg">
                    {meal.emoji}
                  </span>
                  <Link
                    href={`/scan?type=${meal.type}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100"
                    aria-label={`Tambah ${meal.label}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
                <p className="text-sm font-semibold text-ink">{meal.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-ink">
                  {kcal.toLocaleString("id-ID")}
                  <span className="ml-1 text-xs font-medium text-ink-soft">kal</span>
                </p>
                <p className="text-xs text-ink-soft">
                  {meal.items.length > 0
                    ? `${meal.items.length} menu tercatat`
                    : "Belum ada catatan"}
                </p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ===== Baris 4: Rekomendasi ===== */}
      {recommendations.length > 0 && (
        <Card className="animate-fade-up p-6" style={{ animationDelay: "300ms" }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Rekomendasi Menu</h2>
              <p className="text-sm text-ink-soft">
                Muat di sisa {remaining.toLocaleString("id-ID")} kalori — klik tambah untuk mencatat
              </p>
            </div>
            <Link href="/foods" className="text-sm font-semibold text-brand-700 hover:underline">
              Semua menu
            </Link>
          </div>

          <div className="scroll-x flex gap-4 overflow-x-auto pb-2">
            {recommendations.map((food) => (
              <div
                key={food.id}
                className="flex w-[180px] shrink-0 items-center gap-3 rounded-2xl bg-canvas/70 p-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-soft">
                  🍱
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{food.name}</p>
                  <p className="text-xs text-ink-soft">~{food.estimatedCalorie} kal</p>
                </div>
                <button
                  onClick={() => addFood(food)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
                  aria-label={`Tambah ${food.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Maskot dukung */}
      <Card className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <Mascot status={status} size="md" />
        <div className="flex-1">
          <h3 className="text-base font-bold text-ink">
            {status === "warning"
              ? "Waduh, kalori hari ini sudah lewat target!"
              : "Mantap! Asupan kalorimu masih seimbang."}
          </h3>
          <p className="text-sm text-ink-soft">
            {status === "warning"
              ? "Coba atur porsi berikutnya dan tetap aktif bergerak ya."
              : `Sisa ${remaining.toLocaleString("id-ID")} kalori. Vitamin akan bangkit kalau jajan lagi!`}
          </p>
        </div>
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-full bg-ink px-6 text-white hover:bg-ink/90"
        >
          Pantau terus
        </Button>
      </Card>
    </div>
  )
}