"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

export const SDK_LANGUAGES = [
  { label: "Node.js", href: "#sdk", description: "npm / TypeScript" },
  { label: "Python", href: "#sdk", description: "pip package" },
  { label: "Go", href: "#sdk", description: "go get module" },
  { label: "cURL", href: "#sdk", description: "REST examples" },
] as const

export const DOC_LINKS = [
  { label: "API Reference", href: "#docs" },
  { label: "Quickstart", href: "#quickstart" },
  { label: "Webhooks", href: "#webhooks" },
] as const

interface SdkDropdownProps {
  variant?: "desktop" | "mobile"
  onNavigate?: () => void
}

export function SdkDropdown({ variant = "desktop", onNavigate }: SdkDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variant !== "desktop") return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [variant])

  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">SDK</p>
        {SDK_LANGUAGES.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className="flex flex-col rounded-lg px-3 py-2 text-muted-foreground hover:bg-gray-800/50 hover:text-emerald-400"
          >
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span className="text-xs">{item.description}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-emerald-400",
          open && "text-emerald-400"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        SDK
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/40"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Terminal className="h-3.5 w-3.5" />
                Choose your stack
              </p>
            </div>
            {SDK_LANGUAGES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  setOpen(false)
                  onNavigate?.()
                }}
                className="flex flex-col px-4 py-3 transition-colors hover:bg-emerald-500/10"
              >
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
