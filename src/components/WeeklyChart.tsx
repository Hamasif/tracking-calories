"use client"

interface WeeklyChartProps {
  days: { date: string; label: string; total: number; isToday: boolean }[]
  target: number
}

export function WeeklyChart({ days, target }: WeeklyChartProps) {
  const max = Math.max(...days.map((d) => d.total), 1)
  // Skala: bar penuh saat mencapai target (atau nilai tertinggi kalau > target)
  const scaleMax = Math.max(max, target)

  return (
    <div className="flex items-end justify-between gap-2 pt-2 sm:gap-3">
      {days.map((day, i) => {
        const heightPct = Math.round((day.total / scaleMax) * 100)
        const over = day.total > target
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-soft">
              {day.total > 0 ? day.total : ""}
            </span>
            <div className="flex h-32 w-full items-end justify-center sm:h-36">
              <div
                className={`w-full max-w-[22px] rounded-full transition-all duration-500 ease-out ${
                  day.isToday
                    ? "bg-brand-500 shadow-glow"
                    : over
                      ? "bg-stat-rose/70"
                      : "bg-brand-200"
                }`}
                style={{
                  height: `${Math.max(heightPct, day.total > 0 ? 8 : 4)}%`,
                  animationDelay: `${i * 60}ms`,
                }}
                title={`${day.date}: ${day.total} kcal`}
              />
            </div>
            <span
              className={`text-xs font-medium ${
                day.isToday ? "text-brand-700" : "text-ink-faint"
              }`}
            >
              {day.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}