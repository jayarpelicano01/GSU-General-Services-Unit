"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/**
 * Thin top progress bar that sweeps across the screen on every route change,
 * giving instant visual feedback while the new page transitions in.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const raf = useRef<number | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Start the sweep on the next animation frame so state updates are not
    // applied synchronously within the effect body.
    raf.current = requestAnimationFrame(() => {
      setVisible(true)
      setWidth(0)

      const start = performance.now()
      const duration = 450

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        setWidth((1 - Math.pow(1 - t, 3)) * 100)
        if (t < 1) {
          raf.current = requestAnimationFrame(tick)
        } else {
          hideTimer.current = setTimeout(() => setVisible(false), 150)
        }
      }
      raf.current = requestAnimationFrame(tick)
    })

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-indigo-100/60 pointer-events-none"
      aria-hidden="true"
    >
      <div className="h-full bg-indigo-600" style={{ width: `${width}%` }} />
    </div>
  )
}
