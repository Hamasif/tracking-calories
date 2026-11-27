import { Mascot } from "@/components/Mascot"
import { PawPrint } from "lucide-react"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Kiri: sapaan hangat */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-ink p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <PawPrint className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold">Tracking Calories</span>
        </div>

        <div className="relative flex flex-col items-start gap-8">
          <Mascot status="safe" size="lg" />
          <div>
            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
              Pantau kalori harian dengan rapi dan menyenangkan.
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Scan makanan, catat makronutrisi, dan lihat progres mingguanmu —
              ditemani asisten dokter hewan yang siap mengawasi.
            </p>
          </div>

          <div className="flex gap-8">
            {[
              ["7 hari", "progres mingguan"],
              ["1 klik", "catat makanan"],
              ["100%", "data milikmu"],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-brand-200">{num}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          Dibuat dengan Next.js, Prisma & Tailwind CSS
        </p>
      </div>

      {/* Kanan: form */}
      <div className="flex items-center justify-center p-5 sm:p-10">{children}</div>
    </div>
  )
}