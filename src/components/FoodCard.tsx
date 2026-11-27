import Link from "next/link"
import NextImage from "next/image"
import { Card } from "./ui/card"

interface FoodCardProps {
  id: string
  name: string
  imageUrl?: string
  estimatedCalorie: number
  category?: string
  onAdd?: () => void
}

export function FoodCard({ id, name, imageUrl, estimatedCalorie, category, onAdd }: FoodCardProps) {
  const categoryEmoji = {
    sarapan: "🌅",
    siang: "☀️",
    malam: "🌙",
    snack: "🍬",
  }[category ?? ""] || "🍱"

  return (
    <Card className="group overflow-hidden hover:shadow-lift">
      <Link href={`/meals?category=${id}`} className="block">
        <div className="relative h-32 overflow-hidden bg-canvas">
          {imageUrl ? (
            <NextImage
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 250px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint text-2xl">
              {categoryEmoji}
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-ink-soft shadow-soft backdrop-blur">
            {categoryEmoji} {category}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <h3 className="line-clamp-1 font-bold text-ink">{name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-bold text-brand-700">
            ~{estimatedCalorie} <span className="text-xs font-medium text-ink-soft">kal</span>
          </span>
          {onAdd && (
            <button
              onClick={onAdd}
              className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              Tambah
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}