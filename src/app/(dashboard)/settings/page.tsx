"use client"

import { useEffect, useState } from "react"
import { Bell, Clock, PawPrint, Shield, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface ReminderSettings {
  enabled: boolean
  breakfastTime: string
  lunchTime: string
  dinnerTime: string
}

const REMINDER_ROWS = [
  { key: "breakfastTime", label: "Sarapan", icon: "🌅" },
  { key: "lunchTime", label: "Makan siang", icon: "☀️" },
  { key: "dinnerTime", label: "Makan malam", icon: "🌙" },
] as const

export default function SettingsPage() {
  const [targetCalorie, setTargetCalorie] = useState("2000")
  const [reminder, setReminder] = useState<ReminderSettings>({
    enabled: false,
    breakfastTime: "07:00",
    lunchTime: "12:00",
    dinnerTime: "18:00",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) =>
        setReminder({
          enabled: Boolean(data.enabled),
          breakfastTime: data.breakfastTime ?? "07:00",
          lunchTime: data.lunchTime ?? "12:00",
          dinnerTime: data.dinnerTime ?? "18:00",
        })
      )
      .catch(() => {})
  }, [])

  async function saveReminder() {
    setSaving(true)
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminder),
      })
      if (
        reminder.enabled &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission().catch(() => {})
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Pengaturan</h2>
        <p className="text-sm text-ink-soft">
          Atur target kalori dan pengingat makan harianmu
        </p>
      </div>

      {/* Target kalori */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Target Kalori Harian</h3>
            <p className="text-xs text-ink-soft">
              Target yang ingin dicapai setiap hari
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">Target kalori (per hari)</label>
          <Input
            type="number"
            placeholder="2000"
            value={targetCalorie}
            onChange={(e) => setTargetCalorie(e.target.value)}
            className="max-w-[200px]"
          />
          <p className="text-xs text-ink-soft">
            Contoh: 2000 kalori untuk orang dewasa rata-rata
          </p>
        </div>
      </Card>

      {/* Reminder */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stat-amber/15 text-stat-amber">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Reminder Jadwal Makan</h3>
            <p className="text-xs text-ink-soft">Dapat pengingat saat waktu makan tiba</p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-canvas/70 p-4">
          <span className="text-sm font-semibold text-ink">Aktifkan reminder</span>
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={reminder.enabled}
              onChange={(e) => setReminder({ ...reminder, enabled: e.target.checked })}
            />
            <div className="h-6 w-11 rounded-full bg-ink-faint/40 transition-colors peer-checked:bg-brand-500" />
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-soft transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        {reminder.enabled && (
          <div className="mt-4 space-y-3 animate-fade-up">
            {REMINDER_ROWS.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-2xl bg-canvas/70 p-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span>{row.icon}</span> {row.label}
                </span>
                <div className="flex items-center gap-2 text-ink-soft">
                  <Clock className="h-4 w-4" />
                  <input
                    type="time"
                    value={reminder[row.key]}
                    onChange={(e) =>
                      setReminder({ ...reminder, [row.key]: e.target.value })
                    }
                    className="rounded-xl border border-black/10 bg-white px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={saveReminder} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
          {saved && (
            <span className="text-sm font-semibold text-brand-700 animate-fade-up">
              Tersimpan!
            </span>
          )}
        </div>
      </Card>

      {/* Profil */}
      <Card className="flex items-center gap-4 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
          <PawPrint className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-ink">Bubub</h3>
          <p className="text-sm text-ink-soft">Pengaturan akun & profil</p>
        </div>
        <Shield className="h-5 w-5 text-ink-faint" />
      </Card>
    </div>
  )
}