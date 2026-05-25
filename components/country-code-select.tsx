"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"
import { COUNTRY_CODES, type CountryCode } from "@/lib/country-codes"
import { cn } from "@/lib/utils"

interface CountryCodeSelectProps {
  value: CountryCode
  onChange: (country: CountryCode) => void
  disabled?: boolean
}

export function CountryCodeSelect({ value, onChange, disabled }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-full items-center gap-2 rounded-l-xl border border-r-0 border-gray-700 bg-gray-800/80 px-3 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-emerald-500/30"
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          {value.flag}
        </span>
        <span className="tabular-nums">{value.code}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute left-0 top-full z-30 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-xl shadow-black/40"
          >
            {COUNTRY_CODES.map((country) => {
              const selected = country.iso === value.iso
              return (
                <li key={country.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(country)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-emerald-500/10",
                      selected && "bg-emerald-500/15"
                    )}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {country.flag}
                    </span>
                    <span className="flex-1 text-foreground">{country.label}</span>
                    <span className="text-xs tabular-nums text-gray-400">{country.code}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
