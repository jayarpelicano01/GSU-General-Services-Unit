"use client"

import { useTheme } from "@/app/context/ThemeContext"
import { cn } from "@/lib/utils"

const ICON_CDN = "https://cdn.lordicon.com"

type Trigger = "in" | "click" | "hover" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "sequence"

interface LordIconProps {
  icon: string
  trigger?: Trigger
  stroke?: "light" | "regular" | "bold"
  primary?: string
  secondary?: string
  darkPrimary?: string
  darkSecondary?: string
  className?: string
  target?: string
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "")
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ]
}

function tint(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const channel = (c: number) => Math.round(c + (255 - c) * amount)
  return `#${[channel(r), channel(g), channel(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`
}

function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const channel = (c: number) => Math.round(c * (1 - amount))
  return `#${[channel(r), channel(g), channel(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`
}

export function LordIcon({
  icon,
  trigger = "hover",
  stroke = "regular",
  primary = "#4f46e5",
  secondary = "#c7d2fe",
  darkPrimary,
  darkSecondary,
  className,
  target,
}: LordIconProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const primaryColor = isDark ? (darkPrimary ?? tint(primary, 0.38)) : primary
  const secondaryColor = isDark ? (darkSecondary ?? shade(secondary, 0.55)) : secondary

  return (
    <lord-icon
      src={`${ICON_CDN}/${icon}.json`}
      trigger={trigger}
      stroke={stroke}
      colors={`primary:${primaryColor},secondary:${secondaryColor}`}
      target={target}
      className={cn("block", className)}
      aria-hidden="true"
    />
  )
}
