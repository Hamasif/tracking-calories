"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ScanResultPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-md">
      <Card className="animate-fade-up p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Berhasil Disimpan</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Makanan telah ditambahkan ke catatan harian
        </p>

        <div className="mt-6 rounded-2xl bg-canvas/70 p-5">
          <p className="text-3xl font-bold text-ink">+1</p>
          <p className="text-sm text-ink-soft">makanan baru tercatat</p>
        </div>

        <div className="mt-6 space-y-2">
          <Button onClick={() => router.push("/meals")} className="w-full py-3">
            Lihat Jadwal
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full py-3"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </Card>
    </div>
  )
}