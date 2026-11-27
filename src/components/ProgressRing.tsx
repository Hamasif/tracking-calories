"use client"

interface ProgressRingProps {
  value: number
  target: number
  size?: number
  thickness?: number
  className?: string
}

function describeArc(cx: number, cy: number, r: number, progress: number) {
  let clamped = Math.min(Math.max(progress, 0), 1)
  if (clamped <= 0) return ""
  if (clamped >= 0.9999) clamped = 1
  const angle = clamped * 2 * Math.PI - Math.PI / 2
  const x = cx + r * Math.cos(angle)
  const y = cy + r * Math.sin(angle)
  const largeArc = clamped > 0.5 ? 1 : 0
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`
}

export function ProgressRing({
  value,
  target,
  size = 200,
  thickness = 18,
  className = "",
}: ProgressRingProps) {
  const progress = target > 0 ? value / target : 0
  const isOver = value > target
  const radius = (size - thickness) / 2 - 2
  const stroke = isOver ? "#FB7185" : "url(#ring-gradient)"

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8ECE6"
          strokeWidth={thickness}
        />
        {/* Progress */}
        {progress > 0 && (
          <path
            d={describeArc(size / 2, size / 2, radius, progress)}
            fill="none"
            stroke={stroke}
            strokeWidth={thickness}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {value.toLocaleString("id-ID")}
        </span>
        <span className="text-sm font-medium text-ink-soft">Kcal</span>
      </div>
    </div>
  )
}