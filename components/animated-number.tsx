"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  format: (n: number) => string
  className?: string
}

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 75, damping: 18 })
  const display = useTransform(spring, (v) => format(Math.round(v)))
  const [text, setText] = useState(format(0))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    return display.on("change", (v) => setText(v))
  }, [display])

  return (
    <motion.span className={className} layout>
      {text}
    </motion.span>
  )
}
