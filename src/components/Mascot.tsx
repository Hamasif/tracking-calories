"use client"

import { useState } from "react"

interface MascotProps {
  status?: "safe" | "warning"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Mascot({ status = "safe", size = "md", className = "" }: MascotProps) {
  const [bounce, setBounce] = useState(false)

  const sizeClass = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }[size]

  const isWarning = status === "warning"

  return (
    <div
      className={`relative shrink-0 ${sizeClass} ${className} ${
        bounce ? "animate-bounce-cute" : "animate-float-cute"
      }`}
      onMouseEnter={() => setBounce(true)}
      onMouseLeave={() => setBounce(false)}
      title={isWarning ? "Kalori melebihi target!" : "Kalori masih aman"}
    >
      {/* Lingkaran aksen belakang */}
      <div className="absolute -inset-2 rounded-full border border-brand-200/60" />
      <div className="absolute -inset-1 rounded-full bg-brand-100/40 blur-sm" />

      {/* Badan bulat putih */}
      <div className="relative h-full w-full overflow-hidden rounded-full border border-black/5 bg-white shadow-soft">
        {/* Telinga */}
        <div className="absolute -top-1 left-3 h-7 w-5 rotate-[-18deg] rounded-t-full bg-brand-ink" />
        <div className="absolute -top-1 right-3 h-7 w-5 rotate-[18deg] rounded-t-full bg-brand-ink" />

        {/* Mata */}
        <div className="absolute left-[32%] top-[34%] h-[9%] w-[7%] min-h-[6px] min-w-[5px] rounded-full bg-ink" />
        <div className="absolute right-[32%] top-[34%] h-[9%] w-[7%] min-h-[6px] min-w-[5px] rounded-full bg-ink" />

        {/* Pipi merona */}
        <div
          className={`absolute bottom-[34%] left-[14%] h-2 w-3 rounded-full ${
            isWarning ? "bg-stat-rose/50" : "bg-stat-rose/30"
          }`}
        />
        <div
          className={`absolute bottom-[34%] right-[14%] h-2 w-3 rounded-full ${
            isWarning ? "bg-stat-rose/50" : "bg-stat-rose/30"
          }`}
        />

        {/* Mulut */}
        <div
          className={`absolute bottom-[26%] left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-full bg-ink ${
            isWarning ? "rotate-180" : ""
          }`}
        />

        {/* Jas dokter + stetoskop */}
        <div className="absolute inset-x-0 bottom-0 h-[42%] rounded-b-full border-t border-black/5 bg-brand-50">
          <div className="absolute left-1/2 top-0 h-3 w-6 -translate-x-1/2 -translate-y-1/2 rounded-md border border-black/5 bg-white" />
          <div className="absolute left-1/2 top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink-soft/50" />
          <div className="absolute left-1/2 top-[70%] h-2.5 w-1 -translate-x-1/2 rounded-full bg-ink-soft/60" />
        </div>

        {isWarning && (
          <div className="absolute right-1 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stat-rose text-xs font-bold text-white shadow-soft animate-bounce-cute">
            !
          </div>
        )}
      </div>
    </div>
  )
}