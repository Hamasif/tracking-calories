"use client"

interface MacroBarProps {
  label: string
  value: number
  target: number
  unit?: string
  color: string
  icon?: React.ReactNode
}

export function MacroBar({ label, value, target, unit = "g", color, icon }: MacroBarProps) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0

  return (
    <div className="rounded-2xl bg-canvas/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm shadow-soft">
              {icon}
            </span>
          )}
          <span className="text-sm font-semibold text-ink">{label}</span>
        </div>
        <span className="text-xs font-medium text-ink-soft">
          {Math.round(value * 10) / 10} / {target} {unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}