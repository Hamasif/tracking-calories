"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  CalendarDays,
  Home,
  Menu as MenuIcon,
  PawPrint,
  ScanLine,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { Mascot } from "@/components/Mascot"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Jadwal", href: "/meals", icon: CalendarDays },
  { name: "Makanan", href: "/foods", icon: UtensilsCrossed },
  { name: "Pengaturan", href: "/settings", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function HeaderCalorieChip() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/today")
      .then((r) => r.json())
      .then((d) => setTotal(d.total ?? 0))
      .catch(() => {})
  }, [])

  return (
    <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft sm:flex">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <PawPrint className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold text-ink">
        {total === null ? "—" : total.toLocaleString("id-ID")}
      </span>
      <span className="text-xs text-ink-soft">kal hari ini</span>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen bg-canvas">
      {/* ===== Sidebar desktop/tablet ===== */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[84px] flex-col border-r border-black/[0.05] bg-white px-3 py-6 md:flex lg:w-64 lg:px-5">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3 lg:justify-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="hidden lg:block">
            <span className="block text-sm font-bold leading-tight text-ink">Tracking Calories</span>
            <span className="block text-xs text-ink-soft">Asisten dokter hewan</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint lg:block">
            Menu
          </p>
          {navItems.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`group flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all lg:justify-start lg:px-4 ${
                  active
                    ? "bg-brand-50 text-brand-700 shadow-soft"
                    : "text-ink-soft hover:bg-canvas hover:text-ink"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "text-brand-600" : ""}`} />
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <Link
          href="/scan"
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-95 lg:px-4"
        >
          <ScanLine className="h-5 w-5" />
          <span className="hidden lg:inline">Scan Makanan</span>
        </Link>

        <div className="hidden items-center gap-3 rounded-2xl bg-canvas/70 p-3 lg:flex">
          <Mascot status="safe" size="sm" />
          <div>
            <p className="text-xs font-semibold text-ink">Dokter Hewan</p>
            <p className="text-[11px] text-ink-soft">Siap membantu hari ini</p>
          </div>
        </div>
      </aside>

      {/* ===== Drawer mobile ===== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-72 flex-col rounded-r-3xl bg-white p-5 shadow-lift">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
                  <PawPrint className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-ink">Tracking Calories</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-soft hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? "text-brand-600" : ""}`} />
                    {item.name}
                  </Link>
                )
              })}
              <Link
                href="/scan"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-glow"
              >
                <ScanLine className="h-5 w-5" /> Scan Makanan
              </Link>
            </nav>

            <div className="mt-auto flex items-center gap-3 rounded-2xl bg-canvas/70 p-3">
              <Mascot status="safe" size="sm" />
              <div>
                <p className="text-xs font-semibold text-ink">Dokter Hewan</p>
                <p className="text-[11px] text-ink-soft">Siap membantu hari ini</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ===== Konten utama ===== */}
      <div className="md:pl-[84px] lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-black/[0.04] bg-canvas/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:px-6 md:py-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-ink-soft">{today}</p>
              <h1 className="truncate text-base font-bold tracking-tight text-ink md:text-lg">
                {greeting()}, Dokter Hewan 👋
              </h1>
            </div>

            <HeaderCalorieChip />

            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-soft shadow-soft transition-colors hover:text-ink"
              aria-label="Notifikasi"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-stat-rose" />
            </button>

            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-ink text-sm font-bold text-white shadow-soft"
              title="Dokter Hewan"
            >
              DH
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-6 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      {/* ===== Bottom nav mobile ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.05] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-end justify-around px-4 pb-2 pt-1.5">
          {navItems.slice(0, 2).map((item) => (
            <MobileTab key={item.href} item={item} pathname={pathname} />
          ))}

          <Link
            href="/scan"
            className="-mt-7 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition-transform active:scale-95"
            aria-label="Scan makanan"
          >
            <ScanLine className="h-6 w-6" />
            <span className="text-[9px] font-bold">Scan</span>
          </Link>

          {navItems.slice(2).map((item) => (
            <MobileTab key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function MobileTab({
  item,
  pathname,
}: {
  item: { name: string; href: string; icon: typeof Home }
  pathname: string
}) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      className={`flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors ${
        active ? "text-brand-700" : "text-ink-faint"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          active ? "bg-brand-100" : "bg-transparent"
        }`}
      >
        <item.icon className="h-5 w-5" />
      </span>
      {item.name}
    </Link>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return "Selamat pagi"
  if (h < 15) return "Selamat siang"
  if (h < 19) return "Selamat sore"
  return "Selamat malam"
}