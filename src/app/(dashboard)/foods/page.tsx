"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

function MacroField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-ink">{label} (g)</label>
      <Input
        type="number"
        step="0.1"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

const CATEGORY_EMOJI: Record<string, string> = {
  sarapan: "🌅",
  siang: "☀️",
  malam: "🌙",
  snack: "🍬",
}

const CATEGORIES = [
  { value: "sarapan", label: "Sarapan", emoji: "🌅" },
  { value: "siang", label: "Siang", emoji: "☀️" },
  { value: "malam", label: "Malam", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍬" },
]

interface Food {
  id: string
  name: string
  imageUrl: string | null
  estimatedCalorie: number
  protein: number
  carbs: number
  fat: number
  category: string | null
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [calorie, setCalorie] = useState("")
  const [category, setCategory] = useState("sarapan")
  const [imageUrl, setImageUrl] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")

  useEffect(() => {
    loadFoods()
  }, [])

  async function loadFoods() {
    try {
      const res = await fetch("/api/foods")
      const data = await res.json()
      setFoods(data)
    } finally {
      setLoading(false)
    }
  }

  async function addFood() {
    await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        estimatedCalorie: parseInt(calorie) || 0,
        category,
        imageUrl: imageUrl || null,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      }),
    })
    setOpen(false)
    setName("")
    setCalorie("")
    setImageUrl("")
    setProtein("")
    setCarbs("")
    setFat("")
    loadFoods()
  }

  async function deleteFood(id: string) {
    if (!confirm("Hapus menu ini?")) return
    await fetch(`/api/foods/${id}`, { method: "DELETE" })
    loadFoods()
  }

  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Daftar Menu</h2>
          <p className="text-sm text-ink-soft">
            Kelola makanan yang tersedia untuk tracking kalori
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="px-5">
          <Plus className="h-4 w-4" /> Tambah Menu
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-3xl bg-white/70 shadow-soft" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <Card className="flex flex-col items-center p-10 text-center">
          <span className="mb-3 text-4xl">🍱</span>
          <h3 className="text-base font-bold text-ink">Belum ada menu</h3>
          <p className="mb-4 text-sm text-ink-soft">
            Tambahkan makanan favoritmu agar bisa langsung dicatat setiap hari.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Tambah Menu
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foods.map((food) => {
            const emoji = CATEGORY_EMOJI[food.category ?? ""] ?? "🍱"
            return (
              <Card
                key={food.id}
                className="group overflow-hidden hover:shadow-lift"
              >
                <div className="flex h-32 items-center justify-center bg-canvas text-4xl">
                  {emoji}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-bold text-ink">{food.name}</h3>
                    <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                      {emoji} {food.category ?? "lain"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-brand-700">
                    ~{food.estimatedCalorie} <span className="text-xs font-medium text-ink-soft">kal</span>
                  </p>
                  <div className="mt-3 flex gap-1.5 text-[11px] text-ink-soft">
                    <span className="rounded-lg bg-canvas px-2 py-1">P {food.protein}g</span>
                    <span className="rounded-lg bg-canvas px-2 py-1">K {food.carbs}g</span>
                    <span className="rounded-lg bg-canvas px-2 py-1">L {food.fat}g</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFood(food.id)}
                    className="mt-3 w-full text-stat-rose hover:bg-stat-rose/10 hover:text-stat-rose"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal tambah menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <Card className="animate-fade-up max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-black/5 bg-white px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Tambah Menu Baru</h3>
                <p className="text-xs text-ink-soft">Isi informasi makanan untuk dicatat nanti</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Tutup">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Nama Makanan</label>
                <Input
                  placeholder="Contoh: Nasi Goreng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Estimasi Kalori</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={calorie}
                    onChange={(e) => setCalorie(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-ink shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">URL Gambar (opsional)</label>
                <Input
                  placeholder="https://contoh.com/gambar.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MacroField label="Protein" value={protein} onChange={setProtein} />
                <MacroField label="Karbo" value={carbs} onChange={setCarbs} />
                <MacroField label="Lemak" value={fat} onChange={setFat} />
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-black/5 bg-white px-6 py-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={addFood}>Simpan Menu</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}