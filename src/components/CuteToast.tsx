"use client"

interface CuteToastProps {
  message: string
  type?: "success" | "warning" | "info"
  onClose?: () => void
}

export function CuteToast({ message, type = "info", onClose }: CuteToastProps) {
  const style = {
    success: "border-brand-200 bg-brand-50 text-brand-800",
    warning: "border-stat-amber/40 bg-stat-amber/10 text-ink",
    info: "border-black/5 bg-white text-ink",
  }[type]

  const emoji = { success: "✅", warning: "⚠️", info: "🍱" }[type]

  return (
    <div
      className={`animate-fade-up fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-5 py-3 shadow-lift md:bottom-8 ${style}`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 text-ink-faint transition-colors hover:text-ink"
          aria-label="Tutup"
        >
          ✕
        </button>
      )}
    </div>
  )
}