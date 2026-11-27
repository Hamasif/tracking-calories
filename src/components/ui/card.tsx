"use client"

import * as React from "react"
import { cn } from "./button"

type CardProps = React.HTMLAttributes<HTMLDivElement>

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl bg-white text-ink shadow-card transition-shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-bold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

type CardContentProps = React.HTMLAttributes<HTMLDivElement>
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-ink-soft", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter }