"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ExportFormat = "csv" | "json"

interface ExportDataDropdownProps {
  onExport: (format: ExportFormat) => Promise<void> | void
  disabled?: boolean
  recordCount?: number
}

export function ExportDataDropdown({
  onExport,
  disabled,
  recordCount,
}: ExportDataDropdownProps) {
  const [open, setOpen] = useState(false)
  const [busyFormat, setBusyFormat] = useState<ExportFormat | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSelect = async (format: ExportFormat) => {
    setBusyFormat(format)
    setOpen(false)
    try {
      await onExport(format)
    } finally {
      setBusyFormat(null)
    }
  }

  const isBusy = busyFormat !== null
  const showLargeWarning = (recordCount ?? 0) > 500

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !isBusy && setOpen((v) => !v)}
        disabled={disabled || isBusy}
        className="gemrails-button inline-flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing {busyFormat?.toUpperCase()}…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export data
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && !isBusy && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/40"
            role="menu"
          >
            <button
              type="button"
              onClick={() => handleSelect("csv")}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-500/10"
              role="menuitem"
            >
              <FileSpreadsheet className="mt-0.5 h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-foreground">Download as CSV</p>
                <p className="text-xs text-muted-foreground">For Excel / Google Sheets</p>
              </div>
            </button>
            <div className="border-t border-border" />
            <button
              type="button"
              onClick={() => handleSelect("json")}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-500/10"
              role="menuitem"
            >
              <FileJson className="mt-0.5 h-5 w-5 text-teal-400" />
              <div>
                <p className="text-sm font-medium text-foreground">Download as JSON</p>
                <p className="text-xs text-muted-foreground">Structured records</p>
              </div>
            </button>

            {showLargeWarning && (
              <div className="border-t border-border bg-amber-500/5 px-4 py-2">
                <p className="text-xs text-amber-300/90">
                  ~{recordCount} records — export may take a moment.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
