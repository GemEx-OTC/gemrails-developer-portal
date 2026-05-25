"use client"

import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const digits = value.split("").slice(0, length)
  while (digits.length < length) digits.push("")

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
  }, [autoFocus])

  const updateValue = (next: string[]) => onChange(next.join(""))

  const handleChange = (index: number, raw: string) => {
    if (disabled) return
    const digit = raw.replace(/\D/g, "").slice(-1)
    const next = digits.slice()
    next[index] = digit
    updateValue(next)
    if (digit && index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === "Backspace") {
      e.preventDefault()
      const next = digits.slice()
      if (digits[index]) {
        next[index] = ""
        updateValue(next)
      } else if (index > 0) {
        next[index - 1] = ""
        updateValue(next)
        inputRefs.current[index - 1]?.focus()
      }
      return
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length)
    if (!pasted) return
    const next = pasted.padEnd(length, "").slice(0, length).split("")
    while (next.length < length) next.push("")
    onChange(next.join(""))
    const focusIdx = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="One-time code">
      {digits.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.04 }}
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => {
              setFocusedIndex(index)
              inputRefs.current[index]?.select()
            }}
            onBlur={() => setFocusedIndex(null)}
            aria-label={`Digit ${index + 1}`}
            className={cn(
              "h-14 w-11 rounded-xl border-2 text-center text-xl font-bold transition-colors outline-none sm:h-16 sm:w-12 sm:text-2xl",
              disabled && "cursor-not-allowed opacity-60",
              error
                ? "border-red-500/50 bg-red-500/10 text-red-300"
                : focusedIndex === index
                ? "border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/20"
                : digit
                ? "border-emerald-500/40 bg-gray-800 text-white"
                : "border-gray-700 bg-gray-800/60 text-white hover:border-gray-600"
            )}
          />
        </motion.div>
      ))}
    </div>
  )
}
