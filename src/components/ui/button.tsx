"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...domProps }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...domProps}
      />
    )
  }
)
Button.displayName = "Button"

const variants = {
  default: "bg-brand-500 text-white shadow-glow hover:bg-brand-600 active:scale-95",
  destructive: "bg-stat-rose text-white shadow-soft hover:bg-stat-rose/90 active:scale-95",
  outline: "border border-black/10 bg-white text-ink shadow-soft hover:bg-canvas",
  secondary: "bg-canvas text-ink hover:bg-black/5",
  ghost: "text-ink-soft hover:bg-black/5 hover:text-ink",
  link: "text-brand-700 underline-offset-4 hover:underline",
}

const sizes = {
  default: "h-10 px-5 py-2",
  sm: "h-9 px-4",
  lg: "h-12 px-8",
  icon: "h-10 w-10",
}

export { Button, cn }