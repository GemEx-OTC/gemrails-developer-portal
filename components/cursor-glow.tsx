"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CursorGlowProps {
  size?: number
  className?: string
}

export function CursorGlow({
  size = 256,
  className = "bg-emerald-500/10",
}: CursorGlowProps) {
  const [position, setPosition] = useState({ x: -9999, y: -9999 })
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches
    if (prefersReducedMotion || isCoarsePointer) {
      setEnabled(false)
      return
    }

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  if (!enabled) return null

  const offset = size / 2

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none fixed z-0 rounded-full blur-3xl ${className}`}
      style={{ width: size, height: size }}
      animate={{ x: position.x - offset, y: position.y - offset }}
      transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.6 }}
    />
  )
}
