"use client"

import { useEffect, useRef, useState } from "react"

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Sarapan",
  lunch: "Makan siang",
  dinner: "Makan malam",
}

function todayKey(prefix: string) {
  return `${prefix}-${new Date().toISOString().split("T")[0]}`;
}

export function useMealReminder() {
  const [reminderMessage, setReminderMessage] = useState<string | null>(null)
  const settingsRef = useRef<{
    enabled: boolean
    breakfastTime: string
    lunchTime: string
    dinnerTime: string
  } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => {
        settingsRef.current = data
      })
      .catch(() => {
        settingsRef.current = { enabled: false, breakfastTime: "07:00", lunchTime: "12:00", dinnerTime: "18:00" }
      })

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }

    timerRef.current = setInterval(() => {
      checkReminders()
    }, 30000)

    checkReminders()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function notify(message: string) {
    setReminderMessage(message)
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("🍱 Tracking Calories", { body: message })
      } catch {
        // Notification API mungkin tidak tersedia
      }
    }
    setTimeout(() => setReminderMessage(null), 10000)
  }

  function checkReminders() {
    const settings = settingsRef.current
    if (!settings || !settings.enabled) return

    const now = new Date()
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const entries: Array<[string, string]> = [
      ["breakfast", settings.breakfastTime],
      ["lunch", settings.lunchTime],
      ["dinner", settings.dinnerTime],
    ]

    for (const [meal, time] of entries) {
      if (hhmm >= time && !localStorage.getItem(todayKey(`reminder-${meal}`))) {
        localStorage.setItem(todayKey(`reminder-${meal}`), "1")
        notify(`Waktunya ${MEAL_LABELS[meal]}! Jangan lupa catat makanan Anda.`)
      }
    }
  }

  return { reminderMessage }
}